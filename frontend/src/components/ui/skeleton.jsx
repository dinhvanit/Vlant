import React from 'react';
import { cn } from '../../utils/cn'; 

/**
 * Component Skeleton để hiển thị một khung giữ chỗ đang tải.
 * Nó nhận tất cả các props của một thẻ div thông thường, bao gồm cả className.
 */
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50", 
        className 
      )}
      {...props}
    />
  );
};

export { Skeleton };