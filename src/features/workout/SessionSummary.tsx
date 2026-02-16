 import { useStore } from '@/state/store';
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
import { Trophy, Flame, TrendingUp, Zap, Dumbbell } from 'lucide-react';
 
 interface SessionSummaryProps {
   onClose: () => void;
 }
 
 export function SessionSummary({ onClose }: SessionSummaryProps) {
   const { sessions, stats, badges } = useStore();
   const lastSession = sessions[sessions.length - 1];
   
   if (!lastSession) {
     return null;
   }
   
   const duration = lastSession.endedAt
     ? Math.floor((lastSession.endedAt - lastSession.startedAt) / 60000)
     : 0;
   
   const newBadges = badges.filter(
     b => b.unlockedAt && b.unlockedAt > lastSession.startedAt
   );
   
   return (
     <Dialog open onOpenChange={() => onClose()}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="text-center">
             <span className="text-3xl mb-2 block">🎉</span>
             Workout Complete!
           </DialogTitle>
         </DialogHeader>
         
         <div className="space-y-6 py-4">
           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-muted/50 rounded-xl p-4 text-center">
               <Flame className="w-6 h-6 text-recovering mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {lastSession.exerciseEntries?.reduce((sum, e) => sum + e.sets.length, 0) || lastSession.sets.length}
              </div>
               <div className="text-xs text-muted-foreground">Sets Logged</div>
             </div>
             <div className="bg-muted/50 rounded-xl p-4 text-center">
               <TrendingUp className="w-6 h-6 text-ready mx-auto mb-2" />
               <div className="text-2xl font-bold">{duration}</div>
               <div className="text-xs text-muted-foreground">Minutes</div>
             </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center col-span-2">
              <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {lastSession.exerciseEntries?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Exercises</div>
            </div>
           </div>
           
           {/* Focus Muscles */}
           <div className="bg-primary/10 rounded-xl p-4">
             <div className="flex items-center gap-2 mb-2">
               <Zap className="w-4 h-4 text-primary" />
               <span className="text-sm font-medium">Muscles Trained</span>
             </div>
             <div className="flex flex-wrap gap-2">
               {lastSession.focusMuscles.map(muscle => (
                 <span
                   key={muscle}
                   className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium capitalize"
                 >
                   {muscle}
                 </span>
               ))}
             </div>
           </div>
           
           {/* New Badges */}
           {newBadges.length > 0 && (
             <div className="bg-caution/10 rounded-xl p-4 border border-caution/20">
               <div className="flex items-center gap-2 mb-3">
                 <Trophy className="w-5 h-5 text-caution" />
                 <span className="font-medium">Badge Unlocked!</span>
               </div>
               {newBadges.map(badge => (
                 <div key={badge.id} className="flex items-center gap-3">
                   <span className="text-2xl">{badge.icon}</span>
                   <div>
                     <p className="font-medium">{badge.name}</p>
                     <p className="text-sm text-muted-foreground">{badge.description}</p>
                   </div>
                 </div>
               ))}
             </div>
           )}
           
           {/* Streak */}
           <div className="text-center text-sm text-muted-foreground">
             <span className="text-lg">🔥</span> {stats.currentStreak} day streak
           </div>
         </div>
         
         <Button onClick={onClose} className="w-full gradient-primary">
           Continue
         </Button>
       </DialogContent>
     </Dialog>
   );
 }