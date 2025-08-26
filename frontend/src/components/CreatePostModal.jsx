import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Flame, Sparkles, Eye, User, PenTool } from "lucide-react";

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = () => {
    if ((!content.trim() && !title.trim()) || isPosting) return;
    setIsPosting(true);
    
    // Hiệu ứng delay để người dùng thấy animation
    setTimeout(() => {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
        isAnonymous
      });
      onClose();
    }, 2000); // Tăng thời gian để thấy hiệu ứng đẹp hơn
  };

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setTitle("");
        setContent("");
        setIsAnonymous(true);
        setIsPosting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isPosting) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="bg-transparent border-none shadow-none p-0 max-w-lg"
        onInteractOutside={(e) => {
          if (isPosting) e.preventDefault();
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Create a new lantern</DialogTitle>
          <DialogDescription>
            Write your thoughts, choose to be anonymous, and release your lantern into the night.
          </DialogDescription>
        </DialogHeader>

        {/* Main Lantern Container với hiệu ứng sáng */}
        <motion.div
          animate={{
            boxShadow: isPosting
              ? [
                  "0 0 20px 5px rgba(255, 140, 66, 0.3)",
                  "0 0 40px 10px rgba(255, 140, 66, 0.5)",
                  "0 0 60px 15px rgba(255, 140, 66, 0.7)",
                  "0 0 80px 20px rgba(255, 140, 66, 0.4)"
                ]
              : "0 0 10px 0px rgba(255, 140, 66, 0.1)",
          }}
          transition={{ 
            duration: isPosting ? 2 : 0.3, 
            ease: "easeInOut",
            repeat: isPosting ? Infinity : 0,
            repeatType: "reverse"
          }}
          className="relative"
        >
          {/* Lantern Top Cap */}
          <div className="relative h-6 mx-auto w-3/4 mb-2">
            <div 
              className="w-full h-full bg-gradient-to-b from-amber-600 to-amber-700 border-2 border-amber-800 shadow-md"
              style={{ 
                clipPath: 'polygon(20% 0%, 80% 0%, 90% 100%, 10% 100%)',
                borderRadius: '8px 8px 4px 4px'
              }}
            />
            {/* Top handle */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-amber-800 rounded-full border border-amber-900"></div>
          </div>

          {/* Main Lantern Body */}
          <div className="relative bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md border-2 border-primary/30 rounded-none mx-auto w-full max-w-md shadow-2xl"
               style={{ 
                 clipPath: 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)',
                 minHeight: '400px'
               }}>
            
            {/* Inner glow effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/10 to-transparent pointer-events-none rounded-none"
              animate={{
                opacity: isPosting ? [0.3, 0.7, 0.3] : 0.2
              }}
              transition={{
                duration: 1.5,
                repeat: isPosting ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{ clipPath: 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)' }}
            />

            {/* Decorative vertical lines */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="absolute top-0 bottom-0 w-px bg-primary/20" 
                style={{ left: `${10 + (i * 13)}%`}} 
              />
            ))}

            {/* Content Area */}
            <div className="relative z-10 p-8 h-full flex flex-col">
              {/* Header with mode indicator */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    scale: isPosting ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: isPosting ? Infinity : 0
                  }}
                  className="inline-flex items-center gap-2 text-primary mb-2"
                >
                  {isAnonymous ? (
                    <>
                      <Eye className="w-5 h-5" />
                      <span className="text-sm font-medium">Anonymous Lantern</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium">Named Lantern</span>
                    </>
                  )}
                </motion.div>
                <h2 className="text-xl font-bold text-primary">
                  {isPosting ? "Lighting Your Lantern..." : "Craft Your Lantern"}
                </h2>
              </div>

              {/* Title Input */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <PenTool className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium text-primary">Title (Optional)</Label>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your lantern a title..."
                  className="bg-transparent border-primary/30 text-foreground text-center focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                  disabled={isPosting}
                  maxLength={100}
                />
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {title.length}/100
                </div>
              </div>

              {/* Content Textarea */}
              <div className="flex-1 mb-6">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What story will your lantern carry into the night sky..."
                  className="h-full min-h-32 bg-transparent text-foreground text-center border-none focus-visible:ring-0 resize-none text-base placeholder:italic"
                  disabled={isPosting}
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {content.length}/500
                </div>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-center space-x-3 pt-4 border-t border-primary/20">
                <Switch
                  id="anonymous-mode"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                  disabled={isPosting}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="anonymous-mode" className="text-muted-foreground cursor-pointer">
                  Send Anonymously
                </Label>
              </div>
            </div>

            {/* Decorative cross pattern in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-primary/10"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-px h-full bg-primary/10"></div>
            </div>
          </div>

          {/* Lantern Bottom */}
          <div className="relative h-6 mx-auto w-3/4 mt-2">
            <div 
              className="w-full h-full bg-gradient-to-t from-amber-600 to-amber-700 border-2 border-amber-800 shadow-md"
              style={{ 
                clipPath: 'polygon(10% 0%, 90% 0%, 80% 100%, 20% 100%)',
                borderRadius: '4px 4px 8px 8px'
              }}
            />
          </div>

          {/* Hanging Tassel */}
          <div className="mx-auto w-2 flex flex-col items-center mt-2">
            <motion.div 
              className="w-px h-8 bg-red-600"
              animate={{
                scaleY: isPosting ? [1, 1.2, 1] : 1
              }}
              transition={{
                duration: 0.8,
                repeat: isPosting ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="w-4 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full shadow-sm"
              animate={{
                rotate: isPosting ? [-5, 5, -5] : 0
              }}
              transition={{
                duration: 1,
                repeat: isPosting ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Floating particles effect when posting */}
          <AnimatePresence>
            {isPosting && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      x: "50%",
                      y: "50%",
                      scale: 0
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: `${50 + (Math.random() - 0.5) * 200}%`,
                      y: `${50 + (Math.random() - 0.5) * 200}%`,
                      scale: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Release Button */}
        <div className="mt-6 flex justify-center">
          <motion.div
            whileHover={{ scale: isPosting ? 1 : 1.05 }}
            whileTap={{ scale: isPosting ? 1 : 0.95 }}
          >
            <Button
              onClick={handleSubmit}
              disabled={isPosting || (!content.trim() && !title.trim())}
              className="relative rounded-full px-10 py-4 h-16 text-lg font-bold overflow-hidden transition-all duration-500 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground shadow-2xl shadow-primary/40 disabled:opacity-50"
            >
              <AnimatePresence mode="wait">
                {isPosting ? (
                  <motion.div
                    key="posting"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    <span>Releasing into the night...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="release"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Flame className="w-6 h-6" />
                    <span>Release Lantern</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Button glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 rounded-full"
                animate={{
                  opacity: isPosting ? [0.3, 0.7, 0.3] : 0
                }}
                transition={{
                  duration: 1,
                  repeat: isPosting ? Infinity : 0
                }}
              />
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;