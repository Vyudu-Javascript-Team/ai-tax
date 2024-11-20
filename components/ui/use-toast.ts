// This is a simplified version. You might want to implement a more robust toast system.
import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  sonnerToast[variant === 'destructive' ? 'error' : 'success'](title, {
    description,
  });
};