# AO Streamable Token Specification

This specification describes the necessary message handlers and functionality required for a streamable ao token process.

## Token Process

A specification-compliant token process responds to a number of different forms of messages, with each form specified in an Action tag. The full set of Action messages that the standard token support can be found [here](https://cookbook_ao.g8way.io/references/token.html#token-processes) and the additional Action messages are as follows: 

| Name | Description | Read-Only |
|----------|----------|----------|
| CreateStream | initializing the stream | ⤬ |
| ProcessStream | updates the stream | ⤬ |

In the remainder of this section the tags necessary to spawn a compliant token process, along with the form of each of the Action messages and their results is described.

<hr/>

## Spawning Parameter

These additional compliant token processes must carry the following immutable parameters according to their Action Message upon spawning:

| Name | Description | Action Message |
|----------|----------|----------|
| Recipient | To whom you will send the vested amount | CreateStream |
| Quantity | The amount you want to vest | CreateStream |
| StartTime | The start date for vesting | CreateStream |
| VestingPeriod | The period for which you want to vest | CreateStream |
| StreamId | The ID of the current stream | ProcessStream |

<hr>

## Streaming Protocol

### CreateStream(Recipient, Quantity, StartTime, VestingPeriod, StreamId)

Creates the Stream object having all the following necessary fields for creating streamable token, like:
**Sender, Recipient, Quantity, StartTime, CurrentTime, VestingPeriod, EndTime, StreamId, FlowRate, TotalSent, Status**

Example `Action` message:

```shell
    Send({
        Target = "{TokenProcess Identifier}", 
        Tags = {
           Action = "CreateStream", 
           Recipient = "{Wallet Address/Process Id}", 
           Quantity = "Quantity", 
           StartTime = "1720598400", 
           VestingPeriod = "300"
        }
    })
```

Example `Response` message:

```shell
    {
    Recipient = "hYmtonqVyVDnD1L5MxcOmLu06koAY09_4m5mP6SbqXw",
    Data-Protocol = "ao",
    Type = "Message",
    Action = "CreateStream-Success",
    Quantity = "10000",
    From-Process = "O3OKbgd2nGihccR8bVSyhjOuN6hp7YNpeoVm5pk76s0",
    Variant = "ao.TN.1",
    Pushed-For = "yLGmnPEp5j-vwZZKEK6so94DDgCa9vzW4DyunYUT0lI",
    From-Module = "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
    VestingPeriod = "300",
    Ref_ = "66",
    StreamId = "7"
    }
```

### ProcessStream(StreamId)

In ProcessStream we are processing the stream using the **StreamId** and checking the status of the stream according to the timeline set by the creator, and after certain conditions are met, then the processing of the tokens start and distributing among the receiver's address happens and to check these conditions are met or not Cron is used to call the function.

Example `Action` message:

```shell
    Send({
        Target = {TokenProcess Identifier}, 
        Action = "Cron" 
    })
```
Example `Response` message: 

```shell
{
   Recipient = "hYmtonqVyVDnD1L5MxcOmLu06koAY09_4m5mP6SbqXw",
   Data-Protocol = "ao",
   Type = "Message",
   Action = "CreateStream-Success",
   Quantity = "10000",
   From-Process = "ue_9spSt45p1CmmG_03ccmhJKoHEUwGhQQdTwOpY1SA",
   Variant = "ao.TN.1",
   Pushed-For = "-SNCIMXL9q6iY0ULO0sUkmcgeiaTYNWlHNDhnUfbt50",
   From-Module = "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
   VestingPeriod = "1000",
   Ref_ = "2",
   StreamId = "1"
}
```