import EtherIcon from '@/assets/icons/ethereum.png'
// import NotificationIcon from '@/assets/icons/notification.png'
import TokenIcon from '@/assets/icons/token.png'
import { FaSkull } from 'react-icons/fa6'
import { GiMagicBroom } from 'react-icons/gi'

export const EXAMPLE_ITEMS = [
  {
    title: 'Sweep tokens',
    description: 'Do it',
    image: <GiMagicBroom className='w-20 h-20 text-yellow-200' />,
    url: '/examples/sweep',
  },
  {
    title: 'Try 7702',
    description: 'Check',
    image: <FaSkull className='w-20 h-20 text-white' />,
    url: '/examples/batchsend-7702',
  },
  {
    title: 'Send Ether',
    description: 'Sending Ether to another address is the most basic, common transaction that you can do.',
    image: EtherIcon.src,
    url: '/examples/send-ether',
  },
  {
    title: 'Send ERC20 Token',
    description:
      'ERC20 introduces a standard interface for fungible tokens. Use this example to send any ERC20 to another address.',
    image: TokenIcon.src,
    url: '/examples/send-token',
  },
  // {
  //   title: 'Notifications',
  //   description: 'This example is demonstrates how to use the notification system within Nexth.',
  //   image: NotificationIcon.src,
  //   url: '/examples/notifications',
  // },
]
