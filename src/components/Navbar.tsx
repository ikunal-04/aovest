import SVG from 'react-inlinesvg'
import { Link } from 'react-router-dom'

import ConnectBtn from './ConnectBtn'

export default function Navbar() {
  return (
    <div className="px-[70px] py-[30px] bg-aovest-bg flex items-center justify-between w-full">
      <div className="flex items-center">
        <SVG src="/logo.svg" />
      </div>
      <div className="flex items-center gap-4">
        <Link to="/app/vest" className="text-lg text-white font-medium">
          Vest
        </Link>
        <Link to="/app/dashboard" className=" text-lg text-white font-medium">
          History
        </Link>
      </div>
      <div>
        <ConnectBtn />
      </div>
    </div>
  )
}
