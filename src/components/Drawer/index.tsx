import { AnimatePresence, motion } from 'framer-motion'

type DrawerProps = {
  children: React.ReactNode | string
  onClose: () => void
  isOpen: boolean
}
const Drawer: React.FC<DrawerProps> = ({ children, onClose, isOpen }) => {
  const handleDragEnd = (_: any, info: any) => {
    const dragOffsetY = info.offset.y
    if (dragOffsetY > 60) {
      onClose()
    }
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            y: 200
          }}
          animate={{
            y: 0
          }}
          exit={{
            y: 200
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut'
          }}
          drag='y'
          dragConstraints={{ top: 0, bottom: 0 }}
          className='flex h-full w-full flex-col gap-1 bg-red-200'
        >
          <motion.div onDragEnd={handleDragEnd}>----</motion.div>
          {children}
          <div onClick={onClose}>X</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Drawer
