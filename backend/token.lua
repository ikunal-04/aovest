-- processID:  Is9sY9sr-X9jcAzmHYfjMN8wufjqhnz2OnARiD8GYmo
-- VestAO Process Name
local json = require('json')

if not Balances then Balances = { [ao.id] = tonumber(100000) } end

if Name ~= 'VestCoin' then Name = 'VestCoin' end

if Ticker ~= 'VCOIN' then Ticker = 'VCOIN' end

if Symbol ~= 'VCOIN' then Symbol = 'VCOIN' end

if Logo ~= 'https://arweave.net/2tDzQtngmg39dmOvqD0av5K0j6VeWP0YmMqPQIyXgI8' then Logo = 'https://arweave.net/2tDzQtngmg39dmOvqD0av5K0j6VeWP0YmMqPQIyXgI8' end

if Denomination ~= 0 then Denomination = 0 end

StreamId = tostring(0)

Handlers.add('createStream', Handlers.utils.hasMatchingTag('Action', 'CreateStream'), function(msg)
  if not msg.Tags.Sender or not msg.Tags.Recipient or not msg.Tags.Quantity or not msg.Tags.StartTime or not msg.Tags.VestingPeriod then
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'CreateStream-Error',
        Error = 'Sender, Recipient, Quantity, StartTime, and VestingPeriod are required'
      }
    })
  end

  assert(type(msg.Tags.Sender) == 'string', 'Sender is required!')
  assert(type(msg.Tags.Recipient) == 'string', 'Recipient is required!')
  assert(type(msg.Tags.Quantity) == 'string', 'Quantity is required!')
  assert(type(msg.Tags.StartTime) == 'string', 'StartTime is required!')
  assert(type(msg.Tags.VestingPeriod) == 'string', 'VestingPeriod is required!')

  local sender = msg.Tags.Sender
  local recipient = msg.Tags.Recipient
  local quantity = tonumber(msg.Tags.Quantity)
  local startTime = tonumber(msg.Tags.StartTime)
  local vestingPeriod = tonumber(msg.Tags.VestingPeriod)
  local currentTime = tonumber(msg.Timestamp)
  local endTime = startTime + vestingPeriod + 60000

  -- Check for the correct types and values
  print('Current Time: '.. currentTime)
  print('Start Time: '.. startTime)
  print('End Time: '.. endTime)
  print('Vesting Period: '.. vestingPeriod)
  print('Quantity: '.. quantity)
  print('Balances[ao.id]: '.. Balances[ao.id])

  assert(Balances[ao.id] and tonumber(Balances[ao.id]) >= quantity, 'Insufficient Balance to create stream')

  local status = ''

  -- Status checking for the stream
  if currentTime > startTime then
    status = 'InProgress'
  elseif currentTime < startTime then
    status = 'Scheduled'
  elseif currentTime > endTime then
    status = 'Completed'
  end

  -- Initialize Streams if not defined
  if not Streams then 
    Streams = {}
  end

  local streamCount = #Streams
  StreamId = #Streams + 1
  local flowRate = quantity / vestingPeriod

  CaptureCurrentStreamId = StreamId

  -- Create the stream
  Streams[StreamId] = {
    Sender = sender,
    Recipient = recipient,
    Quantity = quantity,
    StartTime = startTime,
    CurrentTime = currentTime,
    VestingPeriod = vestingPeriod,
    EndTime = endTime,
    StreamId = StreamId,
    FlowRate = flowRate,
    TotalSent = 0,
    Status = status
  }

  local streamId = tostring(StreamId)

  -- Send success message
  ao.send({
    Target = ao.id,
    Tags = {
      Action = 'CreateStream-Success',
      StreamId = streamId,
      Recipient = recipient,
      VestingPeriod = tostring(vestingPeriod),
      Quantity = tostring(quantity),
    }
  })
end)

Handlers.add('processStream', Handlers.utils.hasMatchingTag('Action', 'ProcessStream'), function(msg)
  if not msg.Tags.StreamId then
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'ProcessStream-Error',
        Error = 'StreamId is required'
      }
    })
  end

  assert(type(msg.Tags.StreamId) == 'string', 'StreamId is required!')

  local streamId = tonumber(msg.Tags.StreamId)
  local stream = Streams[streamId]

  -- Check if the stream exists
  assert(stream, 'Stream not found')

  local currentTime = tonumber(msg.Timestamp)
  -- Check edge cases with start and ending time
  print('Current Time: '.. currentTime)
  print('Stream End Time: '.. stream.EndTime)
  print('Stream Start Time: '.. stream.StartTime)

  if currentTime < stream.StartTime then
    stream.Status = 'Scheduled'
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'ProcessStream-Scheduled',
        Success = 'Stream is scheduled and has not started yet'
      }
    })
  elseif currentTime > stream.EndTime then
    if stream.TotalSent < stream.Quantity then
      stream.Status = 'Failed'
    end

    stream.Status = 'Failed'
    local streamId = tostring(streamId)
    print('Stream totalsent: '.. stream.TotalSent)
    print('Stream quantity: '.. stream.Quantity)
    if stream.TotalSent == stream.Quantity then
      stream.Status = 'Complete'
    end
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'ProcessStream-Failed',
        Error = 'Total sent is less than quantity or the time has already passed, so the stream failed',
        StreamId = streamId,
        Status = 'Failed'
      }
    })
  end

  -- Calculate the amount to transfer
  local timeElapsed = currentTime - stream.StartTime
  local amountToTransfer = math.min(stream.Quantity - stream.TotalSent, math.floor(stream.FlowRate * timeElapsed) - stream.TotalSent)

  -- Transfer tokens
  if amountToTransfer > 0 then
    ao.send({
      Target = ao.id,
      From = msg.From,
      Tags = {
        Action = 'Transfer',
        Recipient = stream.Recipient,
        Quantity = tostring(amountToTransfer)
      }
    })
    Balances[stream.Recipient] = (Balances[stream.Recipient] or 0) + amountToTransfer
    stream.TotalSent = stream.TotalSent + amountToTransfer
  end

  -- Check if total sent equals initial quantity
  if stream.TotalSent >= stream.Quantity then
    stream.Status = 'Complete'
  else
    stream.Status = 'InProgress'
  end

  -- Send success message
  local streamId = tostring(streamId)
  ao.send({
    Target = ao.id,
    Tags = {
      Action = 'ProcessStream-Success',
      StreamId = streamId,
      Status = stream.Status,
      TotalSent = tostring(stream.TotalSent)
    }
  })
end)

Handlers.add(
  "CronTick", -- handler name
  Handlers.utils.hasMatchingTag("Action", "Cron"), -- handler pattern to identify cron message
  function (msg) -- handler task to execute on cron message
    -- local currentTime = tonumber(msg.Timestamp)
    -- print('CronTick Current Time: '.. currentTime)
    local stream = Streams[CaptureCurrentStreamId]  -- assuming StreamId is the current stream to process
    if stream then
      ao.send({
        Target = ao.id,
        Tags = {
          Action = 'ProcessStream',
          StreamId = tostring(CaptureCurrentStreamId),
          Status = stream.Status,
        }
      })
    end
  end
)

Handlers.add('getStreamsByUser', Handlers.utils.hasMatchingTag('Action', 'GetStreamsByUser'), function(msg)
  
  if not msg.Tags.UserId then
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'GetStreamsByUser-Error',
        Error = 'UserId is required'
      }
    })
  end

  assert(type(msg.Tags.UserId) == 'string', 'UserId is required!')

  local userId = msg.Tags.UserId
  local userStreams = {}

  for streamId, stream in pairs(Streams) do
    print('Stream Sender: '.. stream.Sender)
    if stream.Sender == userId then
      table.insert(userStreams, {
        StreamId = streamId,
        Stream = stream,
        Status = stream.Status,
        VestingPeriod = tostring(stream.VestingPeriod),
        Quantity = tostring(stream.Quantity)
      })
    end
  end
  print('User Streams: '.. json.encode(userStreams))

  -- Check if user has created any streams
  if #userStreams == 0 then
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'GetStreamsByUser-Error',
        Error = 'No streams found for the user'
      }
    })
  end

  ao.send({
    Target = ao.id,
    Tags = {
      Action = 'GetStreamsByUser-Success',
      Streams = json.encode(userStreams)
    }
  })
end)

-- Read Stream
Handlers.add('readStream', Handlers.utils.hasMatchingTag('Action', 'ReadStream'), function(msg)
  if not msg.Tags.StreamId then
    return ao.send({
      Target = ao.id,
      Tags = {
        Action = 'ReadStream-Error',
        Error = 'StreamId is required'
      }
    })
  end

  assert(type(msg.Tags.StreamId) == 'string', 'StreamId is required!')

  local streamId = tonumber(msg.Tags.StreamId)
  local stream = Streams[streamId]

  -- Check if the stream exists
  assert(stream, 'Stream not found')

  local streamId = tostring(streamId)
  return ao.send({
    Target = ao.id,
    Tags = {
      Action = 'ReadStream-Success',
      StreamId = streamId,
      Stream = json.encode(stream)
    }
  })
end)
