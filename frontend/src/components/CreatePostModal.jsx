import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  
  const handleSubmit = () => {
    if (!content.trim()) return; // Không cho gửi bài viết trống
    onSubmit(content); // Gọi hàm onSubmit được truyền từ component cha
    setContent(''); // Reset textarea
    onClose(); // Đóng modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Release a Lantern</DialogTitle>
          <DialogDescription className="text-center">
            Share your anonymous thoughts with the world.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind..."
            className="min-h-32 bg-input-background rounded-2xl resize-none"
            maxLength={2000}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-full glow-effect"
            disabled={!content.trim()}
          >
            Release Lantern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;