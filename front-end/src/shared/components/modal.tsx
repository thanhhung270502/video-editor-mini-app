"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Typography } from "@/shared/components";
import { cn } from "@/shared/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidthClassName?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  maxWidthClassName = "max-w-[500px]",
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="z-dialog fixed inset-0 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className={cn(
              "border-brand-primary bg-brand-primary-dark w-full rounded-3xl border p-8 shadow-2xl",
              maxWidthClassName,
              className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <Typography variant="h4" color="primary">
                {title}
              </Typography>
              <Button
                variant="custom"
                iconOnly
                className="bg-brand-primary-dark-hover text-brand-primary-light hover:bg-error/10 hover:text-error flex size-8 items-center justify-center rounded-md transition-all"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
