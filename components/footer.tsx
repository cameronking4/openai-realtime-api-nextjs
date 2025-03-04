"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full flex justify-center items-center py-8"
    >
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-center">
          <Image
            src="/footer-image.webp"
            alt="Living Well Footer"
            width={600}
            height={200}
            className="object-contain"
          />
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer 