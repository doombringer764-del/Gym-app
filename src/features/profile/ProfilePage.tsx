 import { useStore } from '@/state/store';
 import { RadarChart } from '@/ui/RadarChart';
 import { StatCard } from '@/ui/StatCard';
 import { CONFIG, type RadarAxis } from '@/domain/config';
 import { Flame, Trophy, Dumbbell, Heart, Target, Zap } from 'lucide-react';
 
 export function ProfilePage() {
   const { stats, badges, sessions } = useStore();
   
   // Calculate radar values based on stats
   const radarValues: Record<RadarAxis, number> = {
     Strength: Math.min(100, (stats.heaviestLift?.weight ?? 0) / 3),
     Consistency: Math.min(100, stats.currentStreak * 10),
     'Recovery IQ': stats.recoveryScore,
     Balance: Math.min(100, sessions.length * 5),
     Hypertrophy: Math.min(100, stats.totalSessions * 8),
   };
   
   const unlockedBadges = badges.filter(b => b.unlockedAt);
   const lockedBadges = badges.filter(b => !b.unlockedAt);
   
   return (
     <div className="min-h-screen bg-background pb-24">
       <div className="px-4 pt-6 pb-4">
         <h1 className="text-2xl font-bold text-foreground">Profile</h1>
         <p className="text-muted-foreground mt-1">Your fitness journey</p>
       </div>
       
       {/* Radar Chart */}
       <div className="px-4 mb-6">
         <div className="bg-card rounded-2xl p-5 shadow-soft border border-border">
           <h2 className="text-lg font-semibold mb-4">Progress Overview</h2>
           <div className="flex justify-center">
             <RadarChart values={radarValues} size={220} />
           </div>
         </div>
       </div>
       
       {/* Stats Grid */}
       <div className="px-4 mb-6">
         <h3 className="text-sm font-semibold text-muted-foreground mb-3">Statistics</h3>
         <div className="grid grid-cols-2 gap-3">
           <StatCard
             icon={<Dumbbell className="text-primary" />}
             label="Total Sessions"
             value={stats.totalSessions}
           />
           <StatCard
             icon={<Flame className="text-recovering" />}
             label="Current Streak"
             value={`${stats.currentStreak} days`}
           />
           <StatCard
             icon={<Trophy className="text-caution" />}
             label="PRs Unlocked"
             value={stats.prsUnlocked}
           />
           <StatCard
             icon={<Target className="text-ready" />}
             label="Longest Streak"
             value={`${stats.longestStreak} days`}
           />
           <StatCard
             icon={<Zap className="text-primed" />}
             label="Heaviest Lift"
             value={stats.heaviestLift ? `${stats.heaviestLift.weight}lb` : '--'}
             subValue={stats.heaviestLift?.exercise}
           />
           <StatCard
             icon={<Heart className="text-secondary" />}
             label="Recovery Score"
             value={`${stats.recoveryScore}%`}
           />
         </div>
       </div>
       
       {/* Badges */}
       <div className="px-4">
         <h3 className="text-sm font-semibold text-muted-foreground mb-3">Badges</h3>
         
         {/* Unlocked */}
         {unlockedBadges.length > 0 && (
           <div className="mb-4">
             <p className="text-xs text-muted-foreground mb-2">Unlocked</p>
             <div className="grid grid-cols-3 gap-3">
               {unlockedBadges.map(badge => (
                 <div
                   key={badge.id}
                   className="bg-card rounded-xl p-3 border border-border text-center"
                 >
                   <span className="text-2xl block mb-1">{badge.icon}</span>
                   <p className="text-xs font-medium">{badge.name}</p>
                 </div>
               ))}
             </div>
           </div>
         )}
         
         {/* Locked */}
         {lockedBadges.length > 0 && (
           <div>
             <p className="text-xs text-muted-foreground mb-2">Locked</p>
             <div className="grid grid-cols-3 gap-3">
               {lockedBadges.map(badge => (
                 <div
                   key={badge.id}
                   className="bg-muted/30 rounded-xl p-3 border border-border text-center opacity-50"
                 >
                   <span className="text-2xl block mb-1 grayscale">🔒</span>
                   <p className="text-xs font-medium">{badge.name}</p>
                   <p className="text-[10px] text-muted-foreground">{badge.requirement}</p>
                 </div>
               ))}
             </div>
           </div>
         )}
       </div>
     </div>
   );
 }