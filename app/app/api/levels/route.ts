import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      logger.info('No session found, using mock levels data');
      // Return comprehensive mock data with detailed basketball goals
      const mockLevels = [
        {
          id: 'level-1',
          levelNumber: 1,
          name: 'Rookie Player',
          description: 'Start your basketball journey with the fundamentals',
          pointsRequired: 0,
          badgeIcon: '🏀',
          badgeColor: '#10B981',
          rewards: ['Basic drill access', 'Progress tracking', 'Achievement badges'],
          userProgress: {
            status: 'COMPLETED',
            progress: 100,
            completedGoals: 10,
            totalGoals: 10,
            totalPoints: 100
          },
          goals: [
            {
              id: 'l1g1',
              name: 'First Dribble',
              description: 'Master basic dribbling fundamentals',
              detailedDescription: 'Learn the foundation of basketball ball handling by mastering stationary dribbling with both hands. This goal focuses on developing proper hand positioning, ball control, and rhythm that will serve as the base for all future dribbling skills.',
              instructions: [
                'Stand with feet shoulder-width apart, knees slightly bent',
                'Hold the ball with fingertips, not palm',
                'Start with gentle bounces using your dominant hand',
                'Keep your head up, eyes looking forward',
                'Practice 10 consecutive dribbles without losing control',
                'Switch to non-dominant hand and repeat',
                'Gradually increase speed while maintaining control'
              ],
              skillRequirements: [
                'Basic hand-eye coordination',
                'Ability to bend knees and maintain balance',
                'Understanding of proper basketball stance'
              ],
              tips: [
                'Keep your dribble low and controlled',
                'Use your fingertips, not your palm',
                'Practice in front of a mirror to check form',
                'Start slow and gradually increase speed',
                'Focus on consistency over speed initially'
              ],
              commonMistakes: [
                'Looking down at the ball instead of keeping head up',
                'Dribbling too high, making it easy to steal',
                'Using palm instead of fingertips',
                'Standing too straight without proper knee bend',
                'Rushing the movement without establishing rhythm'
              ],
              relatedDrills: [
                'Stationary Dribbling',
                'Two-Ball Dribbling',
                'Dribble Tag',
                'Mirror Dribbling',
                'Rhythm Dribbling'
              ],
              videoReferences: [
                'Basic Dribbling Fundamentals',
                'Proper Hand Position for Dribbling',
                'Building Dribbling Confidence'
              ],
              estimatedTime: 15,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 10,
              targetUnit: 'consecutive dribbles',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 10,
                personalBest: 15,
                attempts: 5,
                lastAttempt: '2024-01-15'
              }
            },
            {
              id: 'l1g2',
              name: 'Shooting Stance',
              description: 'Learn proper shooting form and stance',
              detailedDescription: 'Develop the fundamental shooting stance that will be the foundation for all future shooting skills. This includes proper foot positioning, body alignment, and hand placement for consistent shooting form.',
              instructions: [
                'Stand with feet shoulder-width apart',
                'Point your shooting foot slightly toward the basket',
                'Keep your shooting hand under the ball',
                'Place guide hand on the side of the ball',
                'Align your shooting elbow under the ball',
                'Keep your head up and eyes on the target',
                'Practice the stance without shooting first'
              ],
              skillRequirements: [
                'Basic balance and coordination',
                'Understanding of dominant vs. non-dominant hand',
                'Ability to maintain consistent positioning'
              ],
              tips: [
                'Practice stance in front of a mirror',
                'Start close to the basket',
                'Focus on consistency over power',
                'Keep your follow-through straight',
                'Develop muscle memory through repetition'
              ],
              commonMistakes: [
                'Placing guide hand under the ball',
                'Shooting elbow flaring out to the side',
                'Feet positioned parallel instead of staggered',
                'Rushing the shot without proper setup',
                'Inconsistent hand placement on the ball'
              ],
              relatedDrills: [
                'Form Shooting',
                'Wall Shooting',
                'Chair Shooting',
                'Mirror Practice',
                'Stance Repetition'
              ],
              videoReferences: [
                'Perfect Shooting Form',
                'Basketball Shooting Fundamentals',
                'Developing Consistent Shooting Stance'
              ],
              estimatedTime: 20,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'proper form shots',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 20,
                personalBest: 25,
                attempts: 8,
                lastAttempt: '2024-01-16'
              }
            },
            {
              id: 'l1g3',
              name: 'Free Throw Basics',
              description: 'Master the fundamentals of free throw shooting',
              detailedDescription: 'Learn the essential components of free throw shooting including proper stance, routine, and follow-through. Free throws are crucial as they represent uncontested scoring opportunities in games.',
              instructions: [
                'Position feet behind the free throw line',
                'Establish consistent pre-shot routine',
                'Focus on the back of the rim',
                'Use proper shooting form learned in previous goal',
                'Follow through with wrist snap',
                'Hold follow-through until ball hits rim',
                'Practice shooting rhythm and consistency'
              ],
              skillRequirements: [
                'Proper shooting stance (from previous goal)',
                'Basic understanding of arc and trajectory',
                'Ability to maintain concentration'
              ],
              tips: [
                'Develop a consistent pre-shot routine',
                'Focus on the back of the rim',
                'Use the same rhythm every time',
                'Practice visualization before shooting',
                'Stay relaxed and confident'
              ],
              commonMistakes: [
                'Changing routine between shots',
                'Aiming for the front of the rim',
                'Rushing the shot',
                'Inconsistent follow-through',
                'Letting misses affect confidence'
              ],
              relatedDrills: [
                'Free Throw Routine Practice',
                'Pressure Free Throws',
                'Visualization Shooting',
                'Rhythm Free Throws',
                'Competition Free Throws'
              ],
              videoReferences: [
                'Free Throw Fundamentals',
                'Developing Free Throw Routine',
                'Mental Approach to Free Throws'
              ],
              estimatedTime: 25,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 10,
              targetUnit: 'made free throws',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 10,
                personalBest: 12,
                attempts: 15,
                lastAttempt: '2024-01-17'
              }
            },
            {
              id: 'l1g4',
              name: 'Layup Practice',
              description: 'Learn proper layup technique and footwork',
              detailedDescription: 'Master the fundamental layup, which is the highest percentage shot in basketball. This includes proper approach, footwork, and soft touch around the rim.',
              instructions: [
                'Start from the right side of the basket',
                'Approach at a 45-degree angle',
                'Use right foot as jumping foot from right side',
                'Bring ball up with right hand',
                'Aim for the top corner of the square on backboard',
                'Use soft touch with gentle release',
                'Practice from both sides of the basket'
              ],
              skillRequirements: [
                'Basic running and jumping ability',
                'Hand-eye coordination',
                'Understanding of proper footwork'
              ],
              tips: [
                'Start slow and focus on form',
                'Use the backboard as your target',
                'Keep your eyes on the target',
                'Practice soft touch with gentle release',
                'Master one side before moving to the other'
              ],
              commonMistakes: [
                'Approaching straight on instead of at an angle',
                'Using wrong foot for takeoff',
                'Shooting too hard off the backboard',
                'Not using the backboard effectively',
                'Rushing the approach without control'
              ],
              relatedDrills: [
                'Mikan Drill',
                'Form Layups',
                'Speed Layups',
                'Reverse Layups',
                'Contested Layups'
              ],
              videoReferences: [
                'Perfect Layup Technique',
                'Layup Footwork Fundamentals',
                'Finishing Around the Rim'
              ],
              estimatedTime: 30,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'successful layups',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 20,
                personalBest: 24,
                attempts: 30,
                lastAttempt: '2024-01-18'
              }
            },
            {
              id: 'l1g5',
              name: 'Ball Handling',
              description: 'Develop basic ball control and handling skills',
              detailedDescription: 'Build upon basic dribbling to develop more advanced ball handling skills including dribbling while moving, changing hands, and maintaining control under pressure.',
              instructions: [
                'Practice stationary ball handling moves',
                'Learn to dribble while walking',
                'Master changing hands while dribbling',
                'Practice dribbling with both hands equally',
                'Work on keeping head up while dribbling',
                'Practice in confined spaces',
                'Gradually increase speed and complexity'
              ],
              skillRequirements: [
                'Basic dribbling skills (from previous goal)',
                'Improved hand-eye coordination',
                'Ability to multitask (dribble while moving)'
              ],
              tips: [
                'Practice daily for consistency',
                'Start with simple moves and progress',
                'Use both hands equally',
                'Keep dribble low and controlled',
                'Practice in different environments'
              ],
              commonMistakes: [
                'Favoring dominant hand too much',
                'Dribbling too high',
                'Looking down at the ball',
                'Practicing only when standing still',
                'Not challenging yourself with new moves'
              ],
              relatedDrills: [
                'Cone Dribbling',
                'Figure-8 Dribbling',
                'Spider Dribbling',
                'Two-Ball Dribbling',
                'Dribble Moves Practice'
              ],
              videoReferences: [
                'Ball Handling Fundamentals',
                'Daily Ball Handling Routine',
                'Advanced Dribbling Moves'
              ],
              estimatedTime: 20,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 15,
              targetUnit: 'minutes of practice',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 15,
                personalBest: 20,
                attempts: 10,
                lastAttempt: '2024-01-19'
              }
            },
            {
              id: 'l1g6',
              name: 'Passing Basics',
              description: 'Learn fundamental passing techniques',
              detailedDescription: 'Master the basic passes in basketball including chest pass, bounce pass, and overhead pass. Good passing is essential for team play and creating scoring opportunities.',
              instructions: [
                'Learn proper chest pass technique',
                'Practice bounce pass fundamentals',
                'Master overhead pass form',
                'Work on passing accuracy',
                'Practice with both hands',
                'Focus on proper follow-through',
                'Develop passing vision and timing'
              ],
              skillRequirements: [
                'Basic ball handling skills',
                'Understanding of teammate positioning',
                'Good hand-eye coordination'
              ],
              tips: [
                'Step into your passes',
                'Use proper follow-through',
                'Practice with a partner when possible',
                'Focus on accuracy over speed',
                'Keep passes crisp and direct'
              ],
              commonMistakes: [
                'Not stepping into passes',
                'Throwing passes too hard',
                'Poor follow-through',
                'Not looking at target before passing',
                'Telegraphing passes to defenders'
              ],
              relatedDrills: [
                'Partner Passing',
                'Wall Passing',
                'Passing Accuracy',
                'Moving Passes',
                'Pressure Passing'
              ],
              videoReferences: [
                'Basketball Passing Fundamentals',
                'Types of Basketball Passes',
                'Improving Passing Accuracy'
              ],
              estimatedTime: 25,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 25,
              targetUnit: 'accurate passes',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 25,
                personalBest: 30,
                attempts: 12,
                lastAttempt: '2024-01-20'
              }
            },
            {
              id: 'l1g7',
              name: 'Footwork Drills',
              description: 'Master basic basketball footwork patterns',
              detailedDescription: 'Develop proper footwork which is the foundation of all basketball movements. This includes pivoting, jab steps, and basic movement patterns that will be used in all aspects of the game.',
              instructions: [
                'Learn proper pivot foot technique',
                'Practice jab step fundamentals',
                'Master triple threat position',
                'Work on lateral movement',
                'Practice forward and backward movement',
                'Develop balance and body control',
                'Combine footwork with ball handling'
              ],
              skillRequirements: [
                'Basic balance and coordination',
                'Understanding of basketball rules regarding pivoting',
                'Ability to maintain low center of gravity'
              ],
              tips: [
                'Stay low with knees bent',
                'Keep feet active and ready',
                'Practice without the ball first',
                'Focus on quick, controlled movements',
                'Maintain balance throughout all movements'
              ],
              commonMistakes: [
                'Standing too upright',
                'Crossing feet when moving laterally',
                'Lifting pivot foot illegally',
                'Moving too slowly',
                'Poor balance during movements'
              ],
              relatedDrills: [
                'Pivot Practice',
                'Jab Step Drills',
                'Lateral Movement',
                'Agility Ladders',
                'Cone Footwork'
              ],
              videoReferences: [
                'Basketball Footwork Fundamentals',
                'Pivot and Jab Step Technique',
                'Improving Basketball Agility'
              ],
              estimatedTime: 20,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'footwork repetitions',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 20,
                personalBest: 25,
                attempts: 8,
                lastAttempt: '2024-01-21'
              }
            },
            {
              id: 'l1g8',
              name: 'Defensive Stance',
              description: 'Learn proper defensive positioning and stance',
              detailedDescription: 'Master the fundamental defensive stance that allows for quick movement in all directions while maintaining balance and the ability to react to offensive players.',
              instructions: [
                'Position feet shoulder-width apart',
                'Keep knees bent and stay low',
                'Maintain straight back posture',
                'Keep hands active and ready',
                'Stay on balls of feet',
                'Practice sliding without crossing feet',
                'Maintain proper distance from opponent'
              ],
              skillRequirements: [
                'Good balance and coordination',
                'Leg strength for staying low',
                'Understanding of defensive principles'
              ],
              tips: [
                'Stay low throughout the entire stance',
                'Keep your head up and eyes on opponent',
                'Practice sliding in both directions',
                'Maintain active hands',
                'Stay disciplined and patient'
              ],
              commonMistakes: [
                'Standing too upright',
                'Crossing feet when sliding',
                'Reaching instead of moving feet',
                'Getting too close to offensive player',
                'Not maintaining stance consistently'
              ],
              relatedDrills: [
                'Defensive Slide',
                'Mirror Drill',
                'Closeout Drill',
                'Stance Hold',
                'Reaction Drill'
              ],
              videoReferences: [
                'Defensive Stance Fundamentals',
                'Proper Defensive Sliding',
                'Basketball Defense Basics'
              ],
              estimatedTime: 15,
              difficulty: 'BEGINNER',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 30,
              targetUnit: 'seconds in stance',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 30,
                personalBest: 45,
                attempts: 6,
                lastAttempt: '2024-01-22'
              }
            },
            {
              id: 'l1g9',
              name: 'Court Awareness',
              description: 'Develop understanding of court positions and basic rules',
              detailedDescription: 'Learn the layout of the basketball court, basic rules, and positional awareness that will help you understand where to be and what to do in different game situations.',
              instructions: [
                'Learn all court markings and their purposes',
                'Understand basic basketball rules',
                'Study the five player positions',
                'Practice finding open spaces on court',
                'Learn to read defensive positioning',
                'Understand offensive and defensive ends',
                'Practice spatial awareness while moving'
              ],
              skillRequirements: [
                'Basic understanding of basketball',
                'Ability to observe and analyze',
                'Good spatial awareness'
              ],
              tips: [
                'Study the court layout regularly',
                'Watch games to see positioning',
                'Practice finding open spaces',
                'Ask questions about rules and positions',
                'Use visualization to understand concepts'
              ],
              commonMistakes: [
                'Not understanding court boundaries',
                'Confusion about offensive vs defensive ends',
                'Poor spacing awareness',
                'Not knowing basic rules',
                'Lack of positional understanding'
              ],
              relatedDrills: [
                'Court Familiarization',
                'Position Practice',
                'Spacing Drills',
                'Rules Quiz',
                'Game Situation Practice'
              ],
              videoReferences: [
                'Basketball Court Layout',
                'Basic Basketball Rules',
                'Understanding Player Positions'
              ],
              estimatedTime: 30,
              difficulty: 'BEGINNER',
              type: 'KNOWLEDGE',
              targetValue: 100,
              targetUnit: 'percent understanding',
              points: 10,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 100,
                personalBest: 100,
                attempts: 3,
                lastAttempt: '2024-01-23'
              }
            },
            {
              id: 'l1g10',
              name: 'Rookie Level Test',
              description: 'Demonstrate mastery of all rookie-level skills',
              detailedDescription: 'Complete a comprehensive assessment that combines all the skills learned in the rookie level. This test evaluates your readiness to advance to the next level of basketball development.',
              instructions: [
                'Demonstrate proper dribbling with both hands',
                'Show correct shooting form and make free throws',
                'Execute proper layup technique from both sides',
                'Display ball handling skills while moving',
                'Demonstrate all three basic passes accurately',
                'Show proper footwork and movement patterns',
                'Maintain defensive stance and slide properly',
                'Answer questions about court awareness and rules'
              ],
              skillRequirements: [
                'Mastery of all previous rookie goals',
                'Ability to perform under evaluation pressure',
                'Confidence in demonstrating skills'
              ],
              tips: [
                'Review all previous goals before testing',
                'Practice combining skills together',
                'Stay calm and confident during test',
                'Focus on proper form over speed',
                'Ask for clarification if needed'
              ],
              commonMistakes: [
                'Rushing through demonstrations',
                'Forgetting proper form under pressure',
                'Not reviewing skills before test',
                'Lack of confidence in abilities',
                'Trying to do too much too fast'
              ],
              relatedDrills: [
                'Skill Combination Practice',
                'Mock Testing',
                'Pressure Situations',
                'Form Review',
                'Confidence Building'
              ],
              videoReferences: [
                'Rookie Skills Assessment',
                'Combining Basketball Fundamentals',
                'Building Basketball Confidence'
              ],
              estimatedTime: 45,
              difficulty: 'BEGINNER',
              type: 'ASSESSMENT',
              targetValue: 80,
              targetUnit: 'percent score',
              points: 10,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 85,
                personalBest: 85,
                attempts: 1,
                lastAttempt: '2024-01-24'
              }
            }
          ]
        },
        {
          id: 'level-2',
          levelNumber: 2,
          name: 'Junior Player',
          description: 'Develop intermediate skills and court awareness',
          pointsRequired: 100,
          badgeIcon: '⭐',
          badgeColor: '#F59E0B',
          rewards: ['Intermediate drills', 'Custom workout builder', 'Video analysis'],
          userProgress: {
            status: 'IN_PROGRESS',
            progress: 60,
            completedGoals: 6,
            totalGoals: 10,
            totalPoints: 90
          },
          goals: [
            {
              id: 'l2g1',
              name: 'Advanced Dribbling',
              description: 'Master crossover and behind-the-back moves',
              detailedDescription: 'Build upon basic dribbling skills to learn advanced moves that will help you create space and beat defenders. Focus on crossover dribbles, behind-the-back moves, and between-the-legs dribbling.',
              instructions: [
                'Master the basic crossover dribble',
                'Learn proper behind-the-back technique',
                'Practice between-the-legs dribbling',
                'Combine moves in sequence',
                'Practice at game speed',
                'Work on change of pace',
                'Use moves to create space'
              ],
              skillRequirements: [
                'Solid basic dribbling foundation',
                'Good hand-eye coordination',
                'Ability to dribble with both hands confidently'
              ],
              tips: [
                'Start slow and build up speed',
                'Practice moves without defense first',
                'Use your body to protect the ball',
                'Make moves sharp and decisive',
                'Keep your head up while executing moves'
              ],
              commonMistakes: [
                'Telegraphing moves to defenders',
                'Dribbling too high during moves',
                'Not using body to shield ball',
                'Rushing moves without control',
                'Only practicing with dominant hand'
              ],
              relatedDrills: [
                'Crossover Progression',
                'Behind-the-Back Practice',
                'Between-the-Legs Drill',
                'Combo Moves',
                'Live Dribbling'
              ],
              videoReferences: [
                'Advanced Dribbling Moves',
                'Crossover Technique',
                'Creating Space with Dribbling'
              ],
              estimatedTime: 25,
              difficulty: 'INTERMEDIATE',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'successful move combinations',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 20,
                personalBest: 25,
                attempts: 12,
                lastAttempt: '2024-01-25'
              }
            },
            {
              id: 'l2g2',
              name: 'Jump Shot Form',
              description: 'Perfect your jump shot technique',
              detailedDescription: 'Develop a consistent jump shot that can be used from various distances. This includes proper footwork, release point, and follow-through for accurate shooting.',
              instructions: [
                'Perfect your shooting stance and grip',
                'Learn proper jump shot footwork',
                'Practice consistent release point',
                'Develop proper follow-through',
                'Work on shot arc and rotation',
                'Practice from different distances',
                'Focus on shooting rhythm'
              ],
              skillRequirements: [
                'Solid shooting stance foundation',
                'Good leg strength for jumping',
                'Consistent hand placement'
              ],
              tips: [
                'Use your legs for power',
                'Keep your elbow under the ball',
                'Follow through with wrist snap',
                'Practice the same form every time',
                'Start close and work your way out'
              ],
              commonMistakes: [
                'Shooting flat without proper arc',
                'Inconsistent release point',
                'Not using legs for power',
                'Poor follow-through',
                'Rushing the shot'
              ],
              relatedDrills: [
                'Form Shooting',
                'Spot Shooting',
                'Progressive Distance',
                'Rhythm Shooting',
                'Game Shots'
              ],
              videoReferences: [
                'Perfect Jump Shot Form',
                'Shooting Mechanics',
                'Consistent Shot Release'
              ],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 15,
              targetUnit: 'made jump shots',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 15,
                personalBest: 18,
                attempts: 20,
                lastAttempt: '2024-01-26'
              }
            },
            {
              id: 'l2g3',
              name: 'Three-Point Shooting',
              description: 'Develop range and accuracy from beyond the arc',
              detailedDescription: 'Extend your shooting range to the three-point line while maintaining accuracy and proper form. This requires additional leg strength and consistent mechanics.',
              instructions: [
                'Build up leg strength for longer shots',
                'Maintain proper form at extended range',
                'Practice from various three-point positions',
                'Work on quick release',
                'Focus on arc and rotation',
                'Develop confidence from distance',
                'Practice game-situation three-pointers'
              ],
              skillRequirements: [
                'Consistent jump shot form',
                'Good leg strength',
                'Proper shooting mechanics'
              ],
              tips: [
                'Use more legs for power, not arms',
                'Keep the same form as shorter shots',
                'Practice daily for consistency',
                'Start closer and work back',
                'Focus on follow-through'
              ],
              commonMistakes: [
                'Changing form for longer shots',
                'Shooting too flat',
                'Not using enough leg power',
                'Inconsistent release point',
                'Lack of confidence from distance'
              ],
              relatedDrills: [
                'Three-Point Progression',
                'Corner Three Practice',
                'Catch and Shoot',
                'Step-Back Threes',
                'Game Speed Shooting'
              ],
              videoReferences: [
                'Three-Point Shooting Technique',
                'Extending Shooting Range',
                'Three-Point Accuracy'
              ],
              estimatedTime: 35,
              difficulty: 'INTERMEDIATE',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'three-point attempts',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 20,
                personalBest: 22,
                attempts: 25,
                lastAttempt: '2024-01-27'
              }
            },
            {
              id: 'l2g4',
              name: 'Reverse Layups',
              description: 'Master layups from the opposite side of the rim',
              detailedDescription: 'Learn to finish layups by going under the basket and shooting from the opposite side. This skill helps avoid defenders and provides more scoring options around the rim.',
              instructions: [
                'Approach the basket from one side',
                'Drive under the basket',
                'Switch the ball to outside hand',
                'Use soft touch on opposite side',
                'Practice from both sides',
                'Work on body control in air',
                'Develop ambidextrous finishing'
              ],
              skillRequirements: [
                'Basic layup technique',
                'Good body control',
                'Ability to use both hands'
              ],
              tips: [
                'Start slow and focus on form',
                'Use soft touch on the finish',
                'Protect the ball with your body',
                'Practice with both hands',
                'Work on timing and rhythm'
              ],
              commonMistakes: [
                'Going too fast without control',
                'Not switching hands properly',
                'Shooting too hard',
                'Poor body positioning',
                'Rushing the finish'
              ],
              relatedDrills: [
                'Reverse Layup Practice',
                'Mikan Drill Variations',
                'Ambidextrous Finishing',
                'Body Control Drills',
                'Game Speed Reverse'
              ],
              videoReferences: [
                'Reverse Layup Technique',
                'Finishing Around the Rim',
                'Advanced Layup Moves'
              ],
              estimatedTime: 25,
              difficulty: 'INTERMEDIATE',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 15,
              targetUnit: 'successful reverse layups',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 15,
                personalBest: 18,
                attempts: 22,
                lastAttempt: '2024-01-28'
              }
            },
            {
              id: 'l2g5',
              name: 'Pick and Roll',
              description: 'Learn fundamental pick and roll concepts',
              detailedDescription: 'Understand and execute the basic pick and roll play, which is one of the most important offensive concepts in basketball. This involves coordination between two players.',
              instructions: [
                'Learn the role of the ball handler',
                'Understand the screener\'s responsibilities',
                'Practice proper timing',
                'Work on reading the defense',
                'Learn when to use the screen',
                'Practice rolling to the basket',
                'Develop passing out of pick and roll'
              ],
              skillRequirements: [
                'Basic ball handling skills',
                'Understanding of teamwork',
                'Ability to read defensive reactions'
              ],
              tips: [
                'Communication is key',
                'Set solid screens',
                'Be patient with timing',
                'Read the defense before acting',
                'Practice with a partner'
              ],
              commonMistakes: [
                'Poor screen angle',
                'Bad timing between players',
                'Not reading the defense',
                'Rushing the play',
                'Lack of communication'
              ],
              relatedDrills: [
                'Pick and Roll Practice',
                'Screen Setting',
                'Rolling Drills',
                'Two-Man Game',
                'Decision Making'
              ],
              videoReferences: [
                'Pick and Roll Fundamentals',
                'Screen and Roll Technique',
                'Reading Pick and Roll Defense'
              ],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'TEAM_PLAY',
              targetValue: 10,
              targetUnit: 'successful pick and rolls',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 10,
                personalBest: 12,
                attempts: 15,
                lastAttempt: '2024-01-29'
              }
            },
            {
              id: 'l2g6',
              name: 'Bounce Pass Mastery',
              description: 'Perfect bounce pass accuracy and timing',
              detailedDescription: 'Master the bounce pass, which is essential for getting the ball through traffic and to teammates in the post. Focus on proper trajectory, timing, and accuracy.',
              instructions: [
                'Learn proper bounce pass technique',
                'Practice hitting the right spot on floor',
                'Work on pass timing',
                'Develop accuracy to moving targets',
                'Practice with both hands',
                'Learn when to use bounce passes',
                'Work on pass velocity control'
              ],
              skillRequirements: [
                'Basic passing fundamentals',
                'Good hand-eye coordination',
                'Understanding of pass timing'
              ],
              tips: [
                'Aim for 2/3 of the distance to target',
                'Use proper follow-through',
                'Practice with moving targets',
                'Vary the speed as needed',
                'Keep passes low and quick'
              ],
              commonMistakes: [
                'Bouncing too close to passer',
                'Bouncing too close to receiver',
                'Poor follow-through',
                'Wrong timing',
                'Inconsistent bounce spot'
              ],
              relatedDrills: [
                'Bounce Pass Accuracy',
                'Moving Target Practice',
                'Post Entry Passes',
                'Traffic Passing',
                'Game Situation Passing'
              ],
              videoReferences: [
                'Bounce Pass Technique',
                'Passing Through Traffic',
                'Post Entry Passing'
              ],
              estimatedTime: 20,
              difficulty: 'INTERMEDIATE',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'accurate bounce passes',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'COMPLETED',
                progress: 100,
                currentValue: 20,
                personalBest: 24,
                attempts: 18,
                lastAttempt: '2024-01-30'
              }
            },
            {
              id: 'l2g7',
              name: 'Fast Break Drills',
              description: 'Learn to run and finish fast breaks',
              detailedDescription: 'Develop the skills needed to effectively run fast breaks including proper spacing, timing, and decision-making in transition situations.',
              instructions: [
                'Learn proper fast break lanes',
                'Practice running at game speed',
                'Work on passing while running',
                'Develop finishing skills in transition',
                'Learn to make quick decisions',
                'Practice 2-on-1 and 3-on-2 situations',
                'Work on communication during breaks'
              ],
              skillRequirements: [
                'Good running speed and endurance',
                'Basic passing and catching skills',
                'Understanding of court spacing'
              ],
              tips: [
                'Run wide in your lane',
                'Keep your head up for passes',
                'Communicate with teammates',
                'Finish strong at the rim',
                'Make quick decisions'
              ],
              commonMistakes: [
                'Running in wrong lanes',
                'Not getting wide enough',
                'Poor communication',
                'Rushing decisions',
                'Not finishing strong'
              ],
              relatedDrills: [
                'Fast Break Lanes',
                '2-on-1 Drill',
                '3-on-2 Drill',
                'Transition Finishing',
                'Full Court Passing'
              ],
              videoReferences: [
                'Fast Break Fundamentals',
                'Transition Basketball',
                'Fast Break Finishing'
              ],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'TEAM_PLAY',
              targetValue: 12,
              targetUnit: 'successful fast breaks',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'IN_PROGRESS',
                progress: 70,
                currentValue: 8,
                personalBest: 8,
                attempts: 10,
                lastAttempt: '2024-01-31'
              }
            },
            {
              id: 'l2g8',
              name: 'Man-to-Man Defense',
              description: 'Master individual defensive principles',
              detailedDescription: 'Learn the fundamentals of man-to-man defense including proper positioning, footwork, and techniques for staying with your assigned player.',
              instructions: [
                'Master defensive stance and movement',
                'Learn proper positioning relative to ball',
                'Practice staying with your player',
                'Work on defensive footwork',
                'Learn to contest shots properly',
                'Practice defensive slides',
                'Develop anticipation skills'
              ],
              skillRequirements: [
                'Good defensive stance',
                'Quick lateral movement',
                'Understanding of defensive principles'
              ],
              tips: [
                'Stay low and balanced',
                'Keep your player in front',
                'Use active hands',
                'Communicate with teammates',
                'Stay disciplined'
              ],
              commonMistakes: [
                'Standing too upright',
                'Reaching instead of moving feet',
                'Poor positioning',
                'Lack of communication',
                'Getting beat by first step'
              ],
              relatedDrills: [
                'Defensive Slides',
                'Closeout Drill',
                'Mirror Drill',
                'Shell Drill',
                'Live Defense'
              ],
              videoReferences: [
                'Man-to-Man Defense',
                'Defensive Positioning',
                'Individual Defense Skills'
              ],
              estimatedTime: 25,
              difficulty: 'INTERMEDIATE',
              type: 'DEFENSE',
              targetValue: 20,
              targetUnit: 'defensive stops',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'NOT_STARTED',
                progress: 0,
                currentValue: 0,
                personalBest: 0,
                attempts: 0,
                lastAttempt: ''
              }
            },
            {
              id: 'l2g9',
              name: 'Rebounding Technique',
              description: 'Learn proper rebounding fundamentals',
              detailedDescription: 'Develop the skills needed to effectively rebound the basketball including positioning, timing, and securing the ball after missed shots.',
              instructions: [
                'Learn proper rebounding stance',
                'Practice boxing out technique',
                'Work on timing your jump',
                'Develop strong hands for securing ball',
                'Learn to read shot trajectories',
                'Practice rebounding from different angles',
                'Work on outlet passing after rebounds'
              ],
              skillRequirements: [
                'Good jumping ability',
                'Strong hands and arms',
                'Understanding of ball trajectory'
              ],
              tips: [
                'Assume every shot will be missed',
                'Box out your opponent first',
                'Go up strong with both hands',
                'Secure the ball before coming down',
                'Look for outlet pass immediately'
              ],
              commonMistakes: [
                'Not boxing out',
                'Poor timing on jump',
                'Weak hands when securing ball',
                'Not reading shot properly',
                'Rushing the outlet pass'
              ],
              relatedDrills: [
                'Box Out Drill',
                'Rebounding Circles',
                'Outlet Passing',
                'Tip Drill',
                'Live Rebounding'
              ],
              videoReferences: [
                'Rebounding Fundamentals',
                'Box Out Technique',
                'Securing Rebounds'
              ],
              estimatedTime: 25,
              difficulty: 'INTERMEDIATE',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 15,
              targetUnit: 'successful rebounds',
              points: 15,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'NOT_STARTED',
                progress: 0,
                currentValue: 0,
                personalBest: 0,
                attempts: 0,
                lastAttempt: ''
              }
            },
            {
              id: 'l2g10',
              name: 'Junior Level Test',
              description: 'Demonstrate mastery of junior-level skills',
              detailedDescription: 'Complete a comprehensive assessment that evaluates all junior-level skills including advanced dribbling, shooting, passing, and defensive concepts.',
              instructions: [
                'Demonstrate advanced dribbling moves',
                'Show consistent jump shot form',
                'Make three-point shots',
                'Execute reverse layups',
                'Perform pick and roll plays',
                'Show accurate bounce passing',
                'Demonstrate fast break skills',
                'Display man-to-man defense',
                'Show proper rebounding technique'
              ],
              skillRequirements: [
                'Mastery of all junior-level goals',
                'Ability to perform under pressure',
                'Understanding of game concepts'
              ],
              tips: [
                'Review all skills before testing',
                'Stay confident and relaxed',
                'Focus on proper technique',
                'Take your time with each skill',
                'Ask questions if unclear'
              ],
              commonMistakes: [
                'Rushing through demonstrations',
                'Poor technique under pressure',
                'Lack of confidence',
                'Not reviewing skills beforehand',
                'Trying to do too much'
              ],
              relatedDrills: [
                'Skill Combination Practice',
                'Mock Assessment',
                'Pressure Situations',
                'Game Simulation',
                'Confidence Building'
              ],
              videoReferences: [
                'Junior Skills Assessment',
                'Intermediate Basketball Skills',
                'Game Application'
              ],
              estimatedTime: 60,
              difficulty: 'INTERMEDIATE',
              type: 'ASSESSMENT',
              targetValue: 80,
              targetUnit: 'percent score',
              points: 15,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: {
                status: 'LOCKED',
                progress: 0,
                currentValue: 0,
                personalBest: 0,
                attempts: 0,
                lastAttempt: ''
              }
            }
          ]
        },
        {
          id: 'level-3',
          levelNumber: 3,
          name: 'Varsity Player',
          description: 'Advanced skills and game strategy',
          pointsRequired: 250,
          badgeIcon: '🏆',
          badgeColor: '#8B5CF6',
          rewards: ['Advanced drills', 'Game strategy videos', 'Performance analytics'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l3g1',
              name: 'Step-Back Jumper',
              description: 'Master the step-back shot technique',
              detailedDescription: 'Learn to create space from defenders using the step-back move, one of the most effective scoring techniques in modern basketball.',
              instructions: [
                'Start in triple threat position',
                'Take a hard jab step forward',
                'Quickly step back with both feet',
                'Rise up into shooting motion',
                'Keep defender off balance',
                'Follow through with confidence',
                'Practice from multiple angles'
              ],
              skillRequirements: ['Solid jump shot foundation', 'Good balance and coordination', 'Quick footwork'],
              tips: ['Sell the jab step', 'Step back far enough to create space', 'Keep shooting form consistent'],
              commonMistakes: ['Not stepping back far enough', 'Losing balance during step-back', 'Rushing the shot'],
              relatedDrills: ['Step-Back Practice', 'Jab Step Shooting', 'Balance Drills'],
              videoReferences: ['Step-Back Shooting Technique', 'Creating Space from Defenders'],
              estimatedTime: 30,
              difficulty: 'ADVANCED',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 25,
              targetUnit: 'made step-back shots',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g2',
              name: 'Fadeaway Shot',
              description: 'Perfect the fadeaway shooting technique',
              detailedDescription: 'Master the fadeaway shot, leaning back to create separation from defenders while maintaining shooting accuracy.',
              instructions: [
                'Start with back to basket or facing up',
                'Begin shooting motion',
                'Lean back while jumping',
                'Keep shooting form intact',
                'Follow through over defender',
                'Land balanced',
                'Practice from post and perimeter'
              ],
              skillRequirements: ['Strong shooting foundation', 'Good core strength', 'Balance control'],
              tips: ['Don\'t lean back too far', 'Keep shooting form consistent', 'Use your core for balance'],
              commonMistakes: ['Leaning back too much', 'Losing shooting form', 'Poor balance on landing'],
              relatedDrills: ['Fadeaway Practice', 'Balance Shooting', 'Core Strength'],
              videoReferences: ['Fadeaway Shooting Technique', 'Post Fadeaway Moves'],
              estimatedTime: 35,
              difficulty: 'ADVANCED',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 20,
              targetUnit: 'made fadeaway shots',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g3',
              name: 'Post Moves',
              description: 'Learn fundamental post-up techniques',
              detailedDescription: 'Develop a repertoire of post moves including drop steps, hook shots, and up-and-under moves for scoring near the basket.',
              instructions: [
                'Establish position in the post',
                'Receive the ball with strong hands',
                'Feel the defender\'s position',
                'Execute drop step move',
                'Practice hook shot technique',
                'Master up-and-under move',
                'Develop both sides equally'
              ],
              skillRequirements: ['Physical strength', 'Good hands', 'Footwork fundamentals'],
              tips: ['Use your body to shield the ball', 'Keep moves simple and effective', 'Practice both directions'],
              commonMistakes: ['Forcing moves', 'Not feeling the defender', 'Weak hands on catches'],
              relatedDrills: ['Post Position Drills', 'Hook Shot Practice', 'Drop Step Moves'],
              videoReferences: ['Post Move Fundamentals', 'Hook Shot Technique'],
              estimatedTime: 40,
              difficulty: 'ADVANCED',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 30,
              targetUnit: 'successful post moves',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g4',
              name: 'Hook Shot',
              description: 'Master the hook shot technique',
              detailedDescription: 'Learn the hook shot, one of the most difficult shots to defend, using proper arc and release point.',
              instructions: [
                'Start with ball in shooting hand',
                'Step across with non-shooting foot',
                'Bring ball up in arc motion',
                'Release at highest point',
                'Follow through with wrist snap',
                'Practice from both sides',
                'Work on baby hook variations'
              ],
              skillRequirements: ['Good shooting touch', 'Proper footwork', 'Arm strength'],
              tips: ['Keep the arc high', 'Use your off-hand for protection', 'Practice close to the basket first'],
              commonMistakes: ['Shooting too flat', 'Not using proper footwork', 'Rushing the release'],
              relatedDrills: ['Hook Shot Practice', 'Mikan Drill Variations', 'Arc Shooting'],
              videoReferences: ['Hook Shot Fundamentals', 'Kareem Abdul-Jabbar Technique'],
              estimatedTime: 30,
              difficulty: 'ADVANCED',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 15,
              targetUnit: 'made hook shots',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g5',
              name: 'Screen Setting',
              description: 'Learn to set effective screens',
              detailedDescription: 'Master the art of setting solid screens to free up teammates, including proper positioning, timing, and technique.',
              instructions: [
                'Communicate with teammate',
                'Set screen at proper angle',
                'Make contact with defender',
                'Hold screen position',
                'Roll or pop after screen',
                'Practice different screen types',
                'Work on screen timing'
              ],
              skillRequirements: ['Physical strength', 'Good timing', 'Team awareness'],
              tips: ['Set screens wide and solid', 'Hold your ground', 'Communicate constantly'],
              commonMistakes: ['Moving while screening', 'Poor screen angle', 'Not holding position'],
              relatedDrills: ['Screen Setting Practice', 'Pick and Roll', 'Screen Timing'],
              videoReferences: ['Screen Setting Fundamentals', 'Effective Screen Techniques'],
              estimatedTime: 25,
              difficulty: 'INTERMEDIATE',
              type: 'TEAM_PLAY',
              targetValue: 20,
              targetUnit: 'effective screens set',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g6',
              name: 'No-Look Pass',
              description: 'Master advanced passing techniques',
              detailedDescription: 'Develop the ability to make no-look passes and other advanced passing techniques to confuse defenders and create scoring opportunities.',
              instructions: [
                'Develop court vision',
                'Practice peripheral vision',
                'Master basic passes first',
                'Use eyes to misdirect',
                'Keep passes crisp and accurate',
                'Practice with moving targets',
                'Work on timing and anticipation'
              ],
              skillRequirements: ['Excellent court vision', 'Strong passing fundamentals', 'Quick decision making'],
              tips: ['Know where teammates will be', 'Don\'t force no-look passes', 'Practice with stationary targets first'],
              commonMistakes: ['Forcing passes', 'Poor timing', 'Lack of court awareness'],
              relatedDrills: ['No-Look Passing', 'Vision Training', 'Advanced Passing'],
              videoReferences: ['No-Look Pass Technique', 'Court Vision Development'],
              estimatedTime: 35,
              difficulty: 'ADVANCED',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 15,
              targetUnit: 'successful no-look passes',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g7',
              name: 'Zone Defense',
              description: 'Understand zone defensive schemes',
              detailedDescription: 'Learn to play and defend against various zone defenses including 2-3, 3-2, and 1-3-1 formations.',
              instructions: [
                'Understand zone responsibilities',
                'Learn proper positioning',
                'Practice zone rotations',
                'Communicate with teammates',
                'Defend your area effectively',
                'Help on drives and posts',
                'Contest shots in your zone'
              ],
              skillRequirements: ['Defensive fundamentals', 'Good communication', 'Team awareness'],
              tips: ['Stay in your zone', 'Communicate constantly', 'Help teammates when needed'],
              commonMistakes: ['Chasing the ball', 'Poor communication', 'Leaving zone too early'],
              relatedDrills: ['Zone Defense Practice', 'Communication Drills', 'Zone Rotations'],
              videoReferences: ['Zone Defense Fundamentals', 'Zone Rotation Techniques'],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'DEFENSE',
              targetValue: 20,
              targetUnit: 'successful zone possessions',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g8',
              name: 'Help Defense',
              description: 'Master help defense rotations',
              detailedDescription: 'Learn to provide help defense, rotate properly, and recover to your man while maintaining team defensive integrity.',
              instructions: [
                'Read offensive player movement',
                'Provide help when needed',
                'Rotate to open players',
                'Recover to your assignment',
                'Communicate help calls',
                'Practice help timing',
                'Work on team rotations'
              ],
              skillRequirements: ['Good defensive stance', 'Quick reactions', 'Team communication'],
              tips: ['Help and recover quickly', 'Communicate help calls', 'Stay balanced'],
              commonMistakes: ['Helping too late', 'Not recovering fast enough', 'Poor communication'],
              relatedDrills: ['Help Defense Drills', 'Rotation Practice', 'Communication Training'],
              videoReferences: ['Help Defense Fundamentals', 'Defensive Rotations'],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'DEFENSE',
              targetValue: 25,
              targetUnit: 'successful help rotations',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g9',
              name: 'Game Situations',
              description: 'Practice end-game scenarios',
              detailedDescription: 'Learn to execute in clutch situations including last-second shots, inbound plays, and pressure situations.',
              instructions: [
                'Practice last-second shots',
                'Learn inbound plays',
                'Handle pressure situations',
                'Execute under time pressure',
                'Practice game-winning scenarios',
                'Work on mental toughness',
                'Study game situations'
              ],
              skillRequirements: ['Mental toughness', 'Clutch shooting', 'Game awareness'],
              tips: ['Stay calm under pressure', 'Practice game situations regularly', 'Trust your preparation'],
              commonMistakes: ['Rushing decisions', 'Poor shot selection', 'Panic under pressure'],
              relatedDrills: ['Clutch Shooting', 'Pressure Situations', 'Game Scenarios'],
              videoReferences: ['Clutch Performance', 'Game-Winning Shots'],
              estimatedTime: 40,
              difficulty: 'ADVANCED',
              type: 'GAME_SITUATION',
              targetValue: 10,
              targetUnit: 'successful clutch plays',
              points: 20,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l3g10',
              name: 'Varsity Level Test',
              description: 'Pass the varsity skills assessment',
              detailedDescription: 'Demonstrate mastery of all varsity-level skills including advanced shooting, post moves, and defensive concepts.',
              instructions: [
                'Execute step-back jumpers',
                'Demonstrate fadeaway shots',
                'Show post move repertoire',
                'Make hook shots consistently',
                'Set effective screens',
                'Execute no-look passes',
                'Play zone defense',
                'Provide help defense',
                'Handle game situations'
              ],
              skillRequirements: ['Mastery of all varsity goals', 'Advanced skill level', 'Game understanding'],
              tips: ['Review all skills thoroughly', 'Practice under pressure', 'Stay confident'],
              commonMistakes: ['Incomplete preparation', 'Nerves affecting performance', 'Rushing demonstrations'],
              relatedDrills: ['Skill Combinations', 'Game Simulations', 'Pressure Testing'],
              videoReferences: ['Varsity Skills Assessment', 'Advanced Basketball Skills'],
              estimatedTime: 75,
              difficulty: 'ADVANCED',
              type: 'ASSESSMENT',
              targetValue: 85,
              targetUnit: 'percent score',
              points: 20,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        },
        // Level 4: All-Star Player
        {
        id: 'level-4',
        levelNumber: 4,
        name: 'All-Star Player',
        description: 'Elite performance and leadership skills',
        pointsRequired: 450,
        badgeIcon: '🌟',
        badgeColor: '#DC2626',
        rewards: ['Elite drills', 'Coaching insights', 'Competition access'],
        userProgress: {
          status: 'LOCKED',
          progress: 0,
          completedGoals: 0,
          totalGoals: 10,
          totalPoints: 0
        },
        goals: [
          {
            id: 'l4g1',
            name: 'Clutch Shooting',
            description: 'Perform under pressure situations',
            detailedDescription: 'Master the mental and physical aspects of clutch shooting, including shot selection, preparation, and execution in high-pressure moments.',
            instructions: [
              'Practice shooting with crowd noise',
              'Simulate game-winning scenarios',
              'Develop pre-shot routine',
              'Work on shot selection',
              'Build mental toughness',
              'Practice under fatigue',
              'Study clutch situations'
            ],
            skillRequirements: ['Consistent shooting form', 'Mental toughness', 'Game awareness'],
            tips: ['Stay calm and confident', 'Trust your preparation', 'Focus on process not outcome'],
            commonMistakes: ['Rushing shots', 'Poor shot selection', 'Overthinking'],
            relatedDrills: ['Pressure Free Throws', 'Game Winners', 'Fatigue Shooting'],
            videoReferences: ['Clutch Shooting Mentality', 'Pressure Performance'],
            estimatedTime: 45,
            difficulty: 'EXPERT',
            type: 'MENTAL_GAME',
            targetValue: 15,
            targetUnit: 'clutch shots made',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g2',
            name: 'Advanced Handles',
            description: 'Master complex dribbling combinations',
            detailedDescription: 'Develop an elite level of ball handling with complex combinations, change of pace, and the ability to break down any defender.',
            instructions: [
              'Master advanced combo moves',
              'Practice change of pace',
              'Work on hesitation moves',
              'Develop ambidextrous skills',
              'Practice under pressure',
              'Work on tight spaces',
              'Study defender reactions'
            ],
            skillRequirements: ['Solid dribbling foundation', 'Quick hands', 'Court vision'],
            tips: ['Keep moves game-applicable', 'Practice both hands equally', 'Study defender tendencies'],
            commonMistakes: ['Overdribbling', 'Predictable moves', 'Poor change of pace'],
            relatedDrills: ['Combo Move Practice', 'Pressure Dribbling', 'Reaction Training'],
            videoReferences: ['Advanced Ball Handling', 'Elite Dribbling Moves'],
            estimatedTime: 40,
            difficulty: 'EXPERT',
            type: 'SKILL_DEVELOPMENT',
            targetValue: 30,
            targetUnit: 'successful combinations',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g3',
            name: 'Court Vision',
            description: 'Develop exceptional court awareness',
            detailedDescription: 'Master the ability to see the entire court, anticipate plays, and make split-second decisions that elevate team performance.',
            instructions: [
              'Practice peripheral vision drills',
              'Study game film',
              'Work on anticipation',
              'Develop passing instincts',
              'Practice reading defenses',
              'Work on quick decisions',
              'Study player tendencies'
            ],
            skillRequirements: ['High basketball IQ', 'Quick processing', 'Team awareness'],
            tips: ['Keep your head up', 'Study the game constantly', 'Trust your instincts'],
            commonMistakes: ['Tunnel vision', 'Overthinking', 'Poor timing'],
            relatedDrills: ['Vision Training', 'Film Study', 'Decision Making'],
            videoReferences: ['Court Vision Development', 'Reading Defenses'],
            estimatedTime: 50,
            difficulty: 'EXPERT',
            type: 'MENTAL_GAME',
            targetValue: 20,
            targetUnit: 'perfect reads',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g4',
            name: 'Leadership Skills',
            description: 'Learn to lead and motivate teammates',
            detailedDescription: 'Develop the leadership qualities needed to elevate teammates\' performance and create a winning team culture.',
            instructions: [
              'Study leadership principles',
              'Practice vocal leadership',
              'Lead by example',
              'Motivate struggling teammates',
              'Make teammates better',
              'Handle team conflicts',
              'Build team chemistry'
            ],
            skillRequirements: ['Strong character', 'Communication skills', 'Team awareness'],
            tips: ['Lead by example first', 'Be positive and encouraging', 'Hold teammates accountable'],
            commonMistakes: ['Being too critical', 'Not leading by example', 'Poor communication'],
            relatedDrills: ['Leadership Scenarios', 'Communication Practice', 'Team Building'],
            videoReferences: ['Basketball Leadership', 'Team Dynamics'],
            estimatedTime: 60,
            difficulty: 'EXPERT',
            type: 'LEADERSHIP',
            targetValue: 10,
            targetUnit: 'leadership moments',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g5',
            name: 'Game Strategy',
            description: 'Master offensive and defensive systems',
            detailedDescription: 'Understand and execute complex offensive and defensive systems, including play calling and strategic adjustments.',
            instructions: [
              'Study offensive systems',
              'Learn defensive schemes',
              'Practice play calling',
              'Understand game flow',
              'Make strategic adjustments',
              'Study opponent tendencies',
              'Execute game plans'
            ],
            skillRequirements: ['High basketball IQ', 'System understanding', 'Quick adaptation'],
            tips: ['Study game film religiously', 'Understand your role', 'Communicate constantly'],
            commonMistakes: ['Not understanding systems', 'Poor execution', 'Lack of communication'],
            relatedDrills: ['System Practice', 'Play Recognition', 'Strategy Implementation'],
            videoReferences: ['Basketball Systems', 'Strategic Thinking'],
            estimatedTime: 55,
            difficulty: 'EXPERT',
            type: 'STRATEGY',
            targetValue: 15,
            targetUnit: 'systems mastered',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g6',
            name: 'Conditioning Peak',
            description: 'Achieve peak physical condition',
            detailedDescription: 'Reach elite level conditioning that allows you to maintain peak performance throughout entire games and seasons.',
            instructions: [
              'Develop cardiovascular endurance',
              'Build explosive power',
              'Improve flexibility',
              'Enhance recovery methods',
              'Maintain consistent training',
              'Monitor performance metrics',
              'Optimize nutrition'
            ],
            skillRequirements: ['Discipline', 'Training knowledge', 'Recovery awareness'],
            tips: ['Consistency is key', 'Listen to your body', 'Focus on recovery'],
            commonMistakes: ['Overtraining', 'Poor recovery', 'Inconsistent effort'],
            relatedDrills: ['Conditioning Circuits', 'Power Training', 'Recovery Protocols'],
            videoReferences: ['Elite Conditioning', 'Athletic Performance'],
            estimatedTime: 90,
            difficulty: 'EXPERT',
            type: 'CONDITIONING',
            targetValue: 30,
            targetUnit: 'training sessions',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g7',
            name: 'Mental Toughness',
            description: 'Develop mental resilience',
            detailedDescription: 'Build the mental fortitude to overcome adversity, maintain focus under pressure, and perform consistently at the highest level.',
            instructions: [
              'Practice visualization',
              'Develop focus techniques',
              'Build confidence',
              'Handle adversity',
              'Maintain composure',
              'Practice mindfulness',
              'Study mental game'
            ],
            skillRequirements: ['Self-awareness', 'Discipline', 'Growth mindset'],
            tips: ['Practice mental skills daily', 'Stay present', 'Learn from setbacks'],
            commonMistakes: ['Negative self-talk', 'Lack of preparation', 'Poor focus'],
            relatedDrills: ['Visualization Practice', 'Pressure Training', 'Mindfulness'],
            videoReferences: ['Mental Toughness', 'Sports Psychology'],
            estimatedTime: 45,
            difficulty: 'EXPERT',
            type: 'MENTAL_GAME',
            targetValue: 20,
            targetUnit: 'mental challenges',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g8',
            name: 'Team Chemistry',
            description: 'Build chemistry with teammates',
            detailedDescription: 'Develop the ability to connect with teammates, understand their strengths and weaknesses, and create seamless team play.',
            instructions: [
              'Study teammate tendencies',
              'Practice team concepts',
              'Build trust on court',
              'Communicate effectively',
              'Support teammates',
              'Develop team timing',
              'Create team identity'
            ],
            skillRequirements: ['Team awareness', 'Communication', 'Adaptability'],
            tips: ['Put team first', 'Be supportive', 'Build trust through consistency'],
            commonMistakes: ['Selfishness', 'Poor communication', 'Not adapting to teammates'],
            relatedDrills: ['Team Building', 'Chemistry Drills', 'Communication Practice'],
            videoReferences: ['Team Chemistry', 'Basketball Teamwork'],
            estimatedTime: 50,
            difficulty: 'EXPERT',
            type: 'TEAM_PLAY',
            targetValue: 25,
            targetUnit: 'team connections',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g9',
            name: 'Game Film Study',
            description: 'Analyze game footage effectively',
            detailedDescription: 'Master the art of breaking down game film to identify patterns, weaknesses, and opportunities for improvement.',
            instructions: [
              'Study your own performance',
              'Analyze opponent tendencies',
              'Identify patterns',
              'Break down plays',
              'Study successful players',
              'Take detailed notes',
              'Apply insights to practice'
            ],
            skillRequirements: ['Analytical mindset', 'Attention to detail', 'Basketball knowledge'],
            tips: ['Be objective about your play', 'Focus on patterns', 'Apply what you learn'],
            commonMistakes: ['Surface-level analysis', 'Not taking notes', 'Failing to apply insights'],
            relatedDrills: ['Film Breakdown', 'Pattern Recognition', 'Analysis Practice'],
            videoReferences: ['Film Study Techniques', 'Game Analysis'],
            estimatedTime: 60,
            difficulty: 'EXPERT',
            type: 'ANALYSIS',
            targetValue: 20,
            targetUnit: 'film sessions',
            points: 25,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          },
          {
            id: 'l4g10',
            name: 'All-Star Level Test',
            description: 'Pass the all-star assessment',
            detailedDescription: 'Demonstrate elite-level skills across all areas including clutch performance, leadership, and advanced basketball concepts.',
            instructions: [
              'Execute clutch shots under pressure',
              'Demonstrate advanced ball handling',
              'Show exceptional court vision',
              'Display leadership qualities',
              'Execute complex strategies',
              'Perform at peak conditioning',
              'Show mental toughness',
              'Demonstrate team chemistry',
              'Analyze game situations'
            ],
            skillRequirements: ['Elite skill level', 'Leadership ability', 'Complete game understanding'],
            tips: ['Showcase all skills', 'Stay composed', 'Lead by example'],
            commonMistakes: ['Trying to do too much', 'Lack of composure', 'Poor leadership'],
            relatedDrills: ['Elite Combinations', 'Leadership Scenarios', 'Pressure Testing'],
            videoReferences: ['All-Star Performance', 'Elite Basketball Skills'],
            estimatedTime: 90,
            difficulty: 'EXPERT',
            type: 'ASSESSMENT',
            targetValue: 90,
            targetUnit: 'percent score',
            points: 25,
            isLevelTest: true,
            personalNotes: '',
            customCriteria: '',
            userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
          }
        ]
      },
        // Level 5: Pro Player
        {
          id: 'level-5',
          levelNumber: 5,
          name: 'Pro Player',
          description: 'Professional-level skills and game understanding',
          pointsRequired: 700,
          badgeIcon: '💎',
          badgeColor: '#059669',
          rewards: ['Pro drills', 'Advanced analytics', 'Mentor access'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l5g1',
              name: 'Signature Moves',
              description: 'Develop your signature moves',
              detailedDescription: 'Create and perfect signature moves that become your trademark, making you unpredictable and difficult to defend.',
              instructions: [
                'Identify your strengths',
                'Develop unique combinations',
                'Perfect timing and execution',
                'Practice against different defenses',
                'Make moves instinctive',
                'Study great players\' signatures',
                'Refine through repetition'
              ],
              skillRequirements: ['Advanced skill level', 'Creativity', 'Muscle memory'],
              tips: ['Build on your strengths', 'Make moves unpredictable', 'Practice until automatic'],
              commonMistakes: ['Copying others exactly', 'Overcomplicating moves', 'Lack of repetition'],
              relatedDrills: ['Signature Move Development', 'Counter Move Practice', 'Creativity Training'],
              videoReferences: ['Signature Move Creation', 'Elite Player Moves'],
              estimatedTime: 60,
              difficulty: 'EXPERT',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 5,
              targetUnit: 'signature moves mastered',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g2',
              name: 'Advanced Footwork',
              description: 'Master complex footwork patterns',
              detailedDescription: 'Develop elite-level footwork that allows for quick changes of direction, perfect balance, and efficient movement patterns.',
              instructions: [
                'Master pivot variations',
                'Perfect change of direction',
                'Develop balance control',
                'Practice footwork combinations',
                'Work on efficiency',
                'Study movement patterns',
                'Integrate with skills'
              ],
              skillRequirements: ['Coordination', 'Balance', 'Agility'],
              tips: ['Focus on efficiency', 'Practice both feet equally', 'Integrate with game moves'],
              commonMistakes: ['Wasted movements', 'Poor balance', 'Neglecting weak foot'],
              relatedDrills: ['Advanced Footwork Patterns', 'Balance Training', 'Agility Ladders'],
              videoReferences: ['Elite Footwork', 'Movement Efficiency'],
              estimatedTime: 45,
              difficulty: 'EXPERT',
              type: 'SKILL_DEVELOPMENT',
              targetValue: 40,
              targetUnit: 'footwork sequences',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g3',
              name: 'Defensive Specialist',
              description: 'Become an elite defender',
              detailedDescription: 'Master all aspects of defense including on-ball, help defense, and the ability to guard multiple positions effectively.',
              instructions: [
                'Perfect defensive stance',
                'Master help defense timing',
                'Develop anticipation skills',
                'Study offensive tendencies',
                'Practice multiple positions',
                'Work on defensive IQ',
                'Build defensive instincts'
              ],
              skillRequirements: ['Quick reflexes', 'High basketball IQ', 'Physical conditioning'],
              tips: ['Stay disciplined', 'Study your opponents', 'Trust your preparation'],
              commonMistakes: ['Reaching too much', 'Poor positioning', 'Lack of communication'],
              relatedDrills: ['Elite Defense Training', 'Anticipation Drills', 'Multi-Position Defense'],
              videoReferences: ['Elite Defense', 'Defensive Specialists'],
              estimatedTime: 50,
              difficulty: 'EXPERT',
              type: 'DEFENSE',
              targetValue: 35,
              targetUnit: 'defensive stops',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g4',
              name: 'Playmaking',
              description: 'Master advanced playmaking',
              detailedDescription: 'Develop the ability to create scoring opportunities for teammates while managing the game flow and making smart decisions.',
              instructions: [
                'Study playmaking concepts',
                'Develop passing creativity',
                'Master pick and roll',
                'Learn to read defenses',
                'Practice decision making',
                'Work on assist-to-turnover ratio',
                'Study elite playmakers'
              ],
              skillRequirements: ['Court vision', 'Passing ability', 'Decision making'],
              tips: ['Make the simple play', 'Keep teammates involved', 'Study the game'],
              commonMistakes: ['Forcing passes', 'Poor decision making', 'Lack of patience'],
              relatedDrills: ['Playmaking Scenarios', 'Decision Training', 'Creative Passing'],
              videoReferences: ['Elite Playmaking', 'Point Guard Skills'],
              estimatedTime: 55,
              difficulty: 'EXPERT',
              type: 'PLAYMAKING',
              targetValue: 30,
              targetUnit: 'assists created',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g5',
              name: 'Shooting Range',
              description: 'Extend shooting range and accuracy',
              detailedDescription: 'Develop unlimited range while maintaining accuracy, including deep three-pointers and quick-release shots.',
              instructions: [
                'Build leg strength',
                'Maintain shooting form',
                'Extend range gradually',
                'Practice quick release',
                'Work on off-dribble shots',
                'Develop catch-and-shoot',
                'Study shooting mechanics'
              ],
              skillRequirements: ['Shooting fundamentals', 'Leg strength', 'Consistent form'],
              tips: ['Extend range gradually', 'Maintain form', 'Practice daily'],
              commonMistakes: ['Changing form for distance', 'Rushing shots', 'Poor leg strength'],
              relatedDrills: ['Range Extension', 'Quick Release', 'Form Shooting'],
              videoReferences: ['Unlimited Range', 'Elite Shooting'],
              estimatedTime: 40,
              difficulty: 'EXPERT',
              type: 'SHOOTING',
              targetValue: 50,
              targetUnit: 'deep shots made',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g6',
              name: 'Game Management',
              description: 'Control game tempo and flow',
              detailedDescription: 'Learn to control the pace of the game, make strategic decisions, and manage situations to your team\'s advantage.',
              instructions: [
                'Understand tempo control',
                'Learn when to push pace',
                'Master game situations',
                'Control possession time',
                'Make strategic decisions',
                'Manage team energy',
                'Study game flow'
              ],
              skillRequirements: ['High basketball IQ', 'Leadership', 'Strategic thinking'],
              tips: ['Read the game situation', 'Control what you can', 'Stay composed'],
              commonMistakes: ['Poor timing', 'Lack of awareness', 'Emotional decisions'],
              relatedDrills: ['Game Management Scenarios', 'Tempo Control', 'Strategic Thinking'],
              videoReferences: ['Game Management', 'Tempo Control'],
              estimatedTime: 50,
              difficulty: 'EXPERT',
              type: 'GAME_MANAGEMENT',
              targetValue: 20,
              targetUnit: 'game situations managed',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g7',
              name: 'Injury Prevention',
              description: 'Master injury prevention techniques',
              detailedDescription: 'Develop comprehensive injury prevention strategies including proper warm-up, recovery, and movement patterns.',
              instructions: [
                'Learn proper warm-up',
                'Master recovery techniques',
                'Study movement patterns',
                'Develop flexibility',
                'Practice injury prevention',
                'Monitor body signals',
                'Work with professionals'
              ],
              skillRequirements: ['Body awareness', 'Discipline', 'Knowledge'],
              tips: ['Consistency is key', 'Listen to your body', 'Prevent rather than treat'],
              commonMistakes: ['Skipping warm-up', 'Ignoring pain', 'Poor recovery'],
              relatedDrills: ['Injury Prevention Routine', 'Movement Patterns', 'Recovery Protocols'],
              videoReferences: ['Injury Prevention', 'Athletic Longevity'],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'HEALTH',
              targetValue: 50,
              targetUnit: 'prevention sessions',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g8',
              name: 'Media Training',
              description: 'Learn professional communication',
              detailedDescription: 'Develop professional communication skills for media interactions, interviews, and public appearances.',
              instructions: [
                'Practice interview skills',
                'Learn media etiquette',
                'Develop key messages',
                'Handle difficult questions',
                'Build public speaking',
                'Study media examples',
                'Practice regularly'
              ],
              skillRequirements: ['Communication skills', 'Confidence', 'Preparation'],
              tips: ['Be authentic', 'Stay on message', 'Practice regularly'],
              commonMistakes: ['Poor preparation', 'Lack of authenticity', 'Defensive responses'],
              relatedDrills: ['Mock Interviews', 'Public Speaking', 'Message Development'],
              videoReferences: ['Media Training', 'Professional Communication'],
              estimatedTime: 45,
              difficulty: 'INTERMEDIATE',
              type: 'COMMUNICATION',
              targetValue: 15,
              targetUnit: 'media interactions',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g9',
              name: 'Mentorship',
              description: 'Begin mentoring younger players',
              detailedDescription: 'Develop the skills to guide and mentor younger players, sharing knowledge and helping them develop their potential.',
              instructions: [
                'Study mentoring principles',
                'Practice teaching skills',
                'Develop patience',
                'Share knowledge effectively',
                'Build relationships',
                'Provide guidance',
                'Lead by example'
              ],
              skillRequirements: ['Leadership', 'Patience', 'Communication'],
              tips: ['Lead by example', 'Be patient', 'Share experiences'],
              commonMistakes: ['Being too critical', 'Lack of patience', 'Poor communication'],
              relatedDrills: ['Mentoring Practice', 'Teaching Drills', 'Leadership Development'],
              videoReferences: ['Mentorship Skills', 'Teaching Basketball'],
              estimatedTime: 60,
              difficulty: 'INTERMEDIATE',
              type: 'MENTORSHIP',
              targetValue: 10,
              targetUnit: 'mentoring sessions',
              points: 30,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l5g10',
              name: 'Pro Level Test',
              description: 'Pass the professional assessment',
              detailedDescription: 'Demonstrate professional-level skills across all areas including signature moves, advanced defense, and leadership qualities.',
              instructions: [
                'Execute signature moves',
                'Show advanced footwork',
                'Demonstrate elite defense',
                'Display playmaking ability',
                'Show unlimited range',
                'Manage game situations',
                'Demonstrate injury prevention',
                'Show media skills',
                'Mentor effectively'
              ],
              skillRequirements: ['Professional skill level', 'Complete game mastery', 'Leadership ability'],
              tips: ['Show complete game', 'Stay professional', 'Demonstrate leadership'],
              commonMistakes: ['Incomplete demonstration', 'Lack of professionalism', 'Poor leadership'],
              relatedDrills: ['Professional Assessment', 'Complete Game Demo', 'Leadership Test'],
              videoReferences: ['Professional Skills', 'Complete Player'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'ASSESSMENT',
              targetValue: 92,
              targetUnit: 'percent score',
              points: 30,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        },
        // Level 6: Elite Player
        {
          id: 'level-6',
          levelNumber: 6,
          name: 'Elite Player',
          description: 'Elite-level mastery and innovation',
          pointsRequired: 1000,
          badgeIcon: '👑',
          badgeColor: '#7C3AED',
          rewards: ['Elite training', 'Innovation access', 'Master classes'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l6g1',
              name: 'Innovation Development',
              description: 'Create new basketball techniques',
              detailedDescription: 'Develop innovative techniques and moves that push the boundaries of basketball, creating new ways to play the game.',
              instructions: [
                'Study game evolution',
                'Experiment with new moves',
                'Test innovative techniques',
                'Refine unique approaches',
                'Document new methods',
                'Share innovations',
                'Influence the game'
              ],
              skillRequirements: ['Creativity', 'Deep game knowledge', 'Experimental mindset'],
              tips: ['Think outside the box', 'Build on existing fundamentals', 'Test thoroughly'],
              commonMistakes: ['Ignoring fundamentals', 'Lack of testing', 'Poor documentation'],
              relatedDrills: ['Innovation Lab', 'Experimental Training', 'Creative Development'],
              videoReferences: ['Basketball Innovation', 'Game Evolution'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'INNOVATION',
              targetValue: 3,
              targetUnit: 'innovations created',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g2',
              name: 'Master Teaching',
              description: 'Become a master teacher',
              detailedDescription: 'Develop the ability to teach complex concepts effectively, breaking down advanced techniques for players of all levels.',
              instructions: [
                'Study teaching methodologies',
                'Develop curriculum design',
                'Practice different teaching styles',
                'Create learning progressions',
                'Master communication techniques',
                'Build assessment methods',
                'Develop teaching philosophy'
              ],
              skillRequirements: ['Teaching ability', 'Patience', 'Communication mastery'],
              tips: ['Adapt to different learning styles', 'Use clear progressions', 'Be patient'],
              commonMistakes: ['One-size-fits-all approach', 'Lack of structure', 'Poor feedback'],
              relatedDrills: ['Teaching Practice', 'Curriculum Development', 'Assessment Design'],
              videoReferences: ['Master Teaching', 'Educational Methods'],
              estimatedTime: 80,
              difficulty: 'EXPERT',
              type: 'TEACHING',
              targetValue: 25,
              targetUnit: 'teaching sessions',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g3',
              name: 'Performance Analytics',
              description: 'Master advanced analytics',
              detailedDescription: 'Use advanced analytics to optimize performance, understand game patterns, and make data-driven decisions.',
              instructions: [
                'Study performance metrics',
                'Learn analytics tools',
                'Analyze game data',
                'Identify performance patterns',
                'Create optimization strategies',
                'Track improvement metrics',
                'Apply insights to training'
              ],
              skillRequirements: ['Analytical thinking', 'Data interpretation', 'Technical skills'],
              tips: ['Focus on actionable insights', 'Use multiple data sources', 'Validate findings'],
              commonMistakes: ['Analysis paralysis', 'Ignoring context', 'Poor data quality'],
              relatedDrills: ['Data Analysis', 'Performance Tracking', 'Metric Development'],
              videoReferences: ['Basketball Analytics', 'Performance Optimization'],
              estimatedTime: 70,
              difficulty: 'EXPERT',
              type: 'ANALYTICS',
              targetValue: 20,
              targetUnit: 'analysis reports',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g4',
              name: 'Global Game Understanding',
              description: 'Master international basketball styles',
              detailedDescription: 'Understand and adapt to different basketball styles from around the world, incorporating diverse approaches into your game.',
              instructions: [
                'Study international styles',
                'Learn different rule sets',
                'Adapt to various playing styles',
                'Understand cultural approaches',
                'Practice international techniques',
                'Develop global perspective',
                'Integrate diverse methods'
              ],
              skillRequirements: ['Adaptability', 'Cultural awareness', 'Open mindset'],
              tips: ['Respect different approaches', 'Find universal principles', 'Adapt gradually'],
              commonMistakes: ['Cultural bias', 'Rigid thinking', 'Poor adaptation'],
              relatedDrills: ['International Style Practice', 'Cultural Study', 'Adaptation Training'],
              videoReferences: ['Global Basketball', 'International Styles'],
              estimatedTime: 75,
              difficulty: 'EXPERT',
              type: 'GLOBAL_UNDERSTANDING',
              targetValue: 15,
              targetUnit: 'international styles mastered',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g5',
              name: 'Mental Mastery',
              description: 'Achieve complete mental control',
              detailedDescription: 'Develop complete mastery over mental aspects of basketball including focus, confidence, and peak performance states.',
              instructions: [
                'Master meditation techniques',
                'Develop peak performance states',
                'Control emotional responses',
                'Build unshakeable confidence',
                'Practice mental rehearsal',
                'Develop flow states',
                'Master pressure situations'
              ],
              skillRequirements: ['Mental discipline', 'Self-awareness', 'Emotional control'],
              tips: ['Practice consistently', 'Start with basics', 'Build gradually'],
              commonMistakes: ['Inconsistent practice', 'Expecting quick results', 'Neglecting basics'],
              relatedDrills: ['Mental Training', 'Meditation Practice', 'Visualization'],
              videoReferences: ['Mental Mastery', 'Peak Performance'],
              estimatedTime: 60,
              difficulty: 'EXPERT',
              type: 'MENTAL_MASTERY',
              targetValue: 30,
              targetUnit: 'mental training sessions',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g6',
              name: 'Physical Optimization',
              description: 'Optimize physical performance',
              detailedDescription: 'Achieve peak physical condition through advanced training methods, nutrition, and recovery techniques.',
              instructions: [
                'Design advanced training programs',
                'Optimize nutrition strategies',
                'Master recovery techniques',
                'Monitor biomarkers',
                'Prevent overtraining',
                'Enhance performance naturally',
                'Maintain peak condition'
              ],
              skillRequirements: ['Training knowledge', 'Discipline', 'Body awareness'],
              tips: ['Listen to your body', 'Use scientific methods', 'Be consistent'],
              commonMistakes: ['Overtraining', 'Poor nutrition', 'Inadequate recovery'],
              relatedDrills: ['Advanced Training', 'Recovery Protocols', 'Performance Testing'],
              videoReferences: ['Physical Optimization', 'Elite Conditioning'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'PHYSICAL_OPTIMIZATION',
              targetValue: 40,
              targetUnit: 'optimization sessions',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g7',
              name: 'Technology Integration',
              description: 'Integrate technology into training',
              detailedDescription: 'Use cutting-edge technology to enhance training, analyze performance, and accelerate skill development.',
              instructions: [
                'Learn training technologies',
                'Use performance tracking devices',
                'Integrate VR/AR training',
                'Analyze biomechanics',
                'Use video analysis tools',
                'Apply motion capture',
                'Optimize with data'
              ],
              skillRequirements: ['Technical literacy', 'Adaptability', 'Innovation mindset'],
              tips: ['Start with basics', 'Focus on practical applications', 'Validate with results'],
              commonMistakes: ['Technology for technology sake', 'Ignoring fundamentals', 'Poor integration'],
              relatedDrills: ['Tech Training', 'Device Integration', 'Data Application'],
              videoReferences: ['Training Technology', 'Performance Tech'],
              estimatedTime: 65,
              difficulty: 'EXPERT',
              type: 'TECHNOLOGY',
              targetValue: 20,
              targetUnit: 'tech integrations',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g8',
              name: 'Legacy Building',
              description: 'Build lasting basketball legacy',
              detailedDescription: 'Create a lasting impact on basketball through contributions to the game, community, and future generations.',
              instructions: [
                'Identify legacy goals',
                'Develop contribution strategies',
                'Build community programs',
                'Mentor future stars',
                'Create lasting change',
                'Document your journey',
                'Inspire others'
              ],
              skillRequirements: ['Vision', 'Leadership', 'Long-term thinking'],
              tips: ['Think beyond yourself', 'Focus on sustainable impact', 'Start now'],
              commonMistakes: ['Waiting too long', 'Lack of planning', 'Self-centered approach'],
              relatedDrills: ['Legacy Planning', 'Community Building', 'Impact Measurement'],
              videoReferences: ['Building Legacy', 'Lasting Impact'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'LEGACY',
              targetValue: 5,
              targetUnit: 'legacy projects',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g9',
              name: 'Continuous Evolution',
              description: 'Commit to lifelong learning',
              detailedDescription: 'Develop a mindset and system for continuous learning and adaptation throughout your basketball journey.',
              instructions: [
                'Create learning systems',
                'Stay curious and open',
                'Adapt to changes',
                'Seek new challenges',
                'Learn from failures',
                'Share knowledge',
                'Evolve constantly'
              ],
              skillRequirements: ['Growth mindset', 'Adaptability', 'Humility'],
              tips: ['Stay humble', 'Embrace change', 'Learn from everyone'],
              commonMistakes: ['Complacency', 'Closed mindset', 'Fear of change'],
              relatedDrills: ['Learning Systems', 'Adaptation Training', 'Growth Mindset'],
              videoReferences: ['Continuous Learning', 'Growth Mindset'],
              estimatedTime: 50,
              difficulty: 'EXPERT',
              type: 'EVOLUTION',
              targetValue: 25,
              targetUnit: 'learning milestones',
              points: 35,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l6g10',
              name: 'Elite Level Test',
              description: 'Pass the elite assessment',
              detailedDescription: 'Demonstrate mastery across all elite domains including innovation, teaching, analytics, and legacy building.',
              instructions: [
                'Demonstrate innovations',
                'Show teaching mastery',
                'Present analytics insights',
                'Display global understanding',
                'Show mental mastery',
                'Demonstrate physical optimization',
                'Show technology integration',
                'Present legacy projects',
                'Show continuous evolution'
              ],
              skillRequirements: ['Elite mastery', 'Innovation ability', 'Teaching excellence'],
              tips: ['Show complete mastery', 'Demonstrate innovation', 'Think holistically'],
              commonMistakes: ['Incomplete demonstration', 'Lack of innovation', 'Poor integration'],
              relatedDrills: ['Elite Assessment', 'Mastery Demo', 'Innovation Showcase'],
              videoReferences: ['Elite Performance', 'Complete Mastery'],
              estimatedTime: 150,
              difficulty: 'EXPERT',
              type: 'ASSESSMENT',
              targetValue: 95,
              targetUnit: 'percent score',
              points: 35,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        },
        // Level 7: Superstar Player
        {
          id: 'level-7',
          levelNumber: 7,
          name: 'Superstar Player',
          description: 'Reach superstar status with elite performance',
          pointsRequired: 1350,
          badgeIcon: '⭐',
          badgeColor: '#F59E0B',
          rewards: ['Superstar training', 'Elite mentorship', 'Championship preparation'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l7g1',
              name: 'Clutch Performance',
              description: 'Deliver in high-pressure situations',
              detailedDescription: 'Master the art of performing under pressure, making crucial plays when the game is on the line. Develop the mental toughness and skill execution needed for clutch moments.',
              instructions: [
                'Practice high-pressure scenarios',
                'Develop pre-shot routines',
                'Master breathing techniques',
                'Visualize successful outcomes',
                'Execute under simulated pressure',
                'Build confidence through repetition',
                'Stay composed in critical moments'
              ],
              skillRequirements: ['Mental toughness', 'Pressure experience', 'Consistent execution'],
              tips: ['Trust your training', 'Focus on process not outcome', 'Embrace pressure'],
              commonMistakes: ['Overthinking', 'Changing routine', 'Avoiding pressure'],
              relatedDrills: ['Pressure Free Throws', 'Game Winner Practice', 'Clutch Scenarios'],
              videoReferences: ['Clutch Performance', 'Pressure Training'],
              estimatedTime: 60,
              difficulty: 'EXPERT',
              type: 'MENTAL',
              targetValue: 10,
              targetUnit: 'clutch shots made',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g2',
              name: 'Advanced Court Vision',
              description: 'See plays before they develop',
              detailedDescription: 'Develop exceptional court awareness and anticipation skills, reading the game multiple steps ahead and making plays others cannot see.',
              instructions: [
                'Study game film extensively',
                'Practice reading defenses',
                'Anticipate player movements',
                'Develop peripheral vision',
                'Master no-look passes',
                'Create opportunities for teammates',
                'Control game tempo'
              ],
              skillRequirements: ['Game experience', 'Pattern recognition', 'Basketball IQ'],
              tips: ['Watch the whole court', 'Study opponent tendencies', 'Trust your instincts'],
              commonMistakes: ['Tunnel vision', 'Forcing plays', 'Ignoring teammates'],
              relatedDrills: ['Vision Training', 'Passing Lanes', 'Court Awareness'],
              videoReferences: ['Court Vision Mastery', 'Reading Defenses'],
              estimatedTime: 75,
              difficulty: 'EXPERT',
              type: 'VISION',
              targetValue: 15,
              targetUnit: 'assists in game',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g3',
              name: 'Signature Move Mastery',
              description: 'Perfect your unique basketball move',
              detailedDescription: 'Develop and master a signature move that becomes your trademark, something opponents know is coming but cannot stop.',
              instructions: [
                'Identify your natural strengths',
                'Study signature moves of legends',
                'Develop your unique variation',
                'Practice move repetition',
                'Add counter moves',
                'Master timing and setup',
                'Make it unstoppable'
              ],
              skillRequirements: ['Technical skill', 'Creativity', 'Muscle memory'],
              tips: ['Build on your strengths', 'Perfect the basics first', 'Add personal flair'],
              commonMistakes: ['Copying exactly', 'Neglecting counters', 'Poor timing'],
              relatedDrills: ['Move Repetition', 'Counter Development', 'Game Application'],
              videoReferences: ['Signature Moves', 'Move Development'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'SKILL',
              targetValue: 1,
              targetUnit: 'signature move mastered',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g4',
              name: 'Elite Conditioning',
              description: 'Reach peak physical condition',
              detailedDescription: 'Achieve superstar-level fitness and conditioning that allows you to maintain peak performance throughout entire games and seasons.',
              instructions: [
                'Develop comprehensive fitness plan',
                'Focus on basketball-specific training',
                'Build explosive power',
                'Enhance endurance capacity',
                'Improve recovery methods',
                'Monitor performance metrics',
                'Maintain year-round fitness'
              ],
              skillRequirements: ['Dedication', 'Training knowledge', 'Recovery discipline'],
              tips: ['Consistency is key', 'Progressive overload', 'Listen to your body'],
              commonMistakes: ['Overtraining', 'Ignoring recovery', 'Poor nutrition'],
              relatedDrills: ['Plyometric Training', 'Endurance Circuits', 'Recovery Protocols'],
              videoReferences: ['Elite Conditioning', 'Performance Training'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'FITNESS',
              targetValue: 95,
              targetUnit: 'fitness score',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g5',
              name: 'Media Excellence',
              description: 'Master media relations and public speaking',
              detailedDescription: 'Develop professional communication skills for interviews, public appearances, and media interactions as a superstar athlete.',
              instructions: [
                'Practice interview techniques',
                'Develop key messages',
                'Master public speaking',
                'Handle difficult questions',
                'Build personal brand',
                'Engage with fans professionally',
                'Represent the sport positively'
              ],
              skillRequirements: ['Communication skills', 'Confidence', 'Professionalism'],
              tips: ['Be authentic', 'Stay positive', 'Prepare key points'],
              commonMistakes: ['Being defensive', 'Saying too much', 'Lack of preparation'],
              relatedDrills: ['Mock Interviews', 'Public Speaking', 'Media Training'],
              videoReferences: ['Media Relations', 'Professional Communication'],
              estimatedTime: 45,
              difficulty: 'ADVANCED',
              type: 'COMMUNICATION',
              targetValue: 10,
              targetUnit: 'media appearances',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g6',
              name: 'Championship Mindset',
              description: 'Develop the mentality of a champion',
              detailedDescription: 'Cultivate the psychological approach and mindset that separates champions from talented players, focusing on winning and team success.',
              instructions: [
                'Study championship teams',
                'Develop winning habits',
                'Focus on team success',
                'Handle pressure situations',
                'Lead by example',
                'Maintain high standards',
                'Never settle for less'
              ],
              skillRequirements: ['Mental strength', 'Leadership', 'Competitive drive'],
              tips: ['Think team first', 'Embrace challenges', 'Stay hungry'],
              commonMistakes: ['Individual focus', 'Complacency', 'Fear of failure'],
              relatedDrills: ['Mental Training', 'Leadership Exercises', 'Pressure Situations'],
              videoReferences: ['Championship Mindset', 'Winning Mentality'],
              estimatedTime: 60,
              difficulty: 'EXPERT',
              type: 'MENTAL',
              targetValue: 1,
              targetUnit: 'championship mindset achieved',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g7',
              name: 'Advanced Analytics',
              description: 'Use data to optimize performance',
              detailedDescription: 'Master the use of advanced basketball analytics to understand your game, identify areas for improvement, and optimize performance.',
              instructions: [
                'Learn key basketball metrics',
                'Analyze your performance data',
                'Identify efficiency opportunities',
                'Track improvement over time',
                'Use data for decision making',
                'Understand team analytics',
                'Apply insights to training'
              ],
              skillRequirements: ['Analytical thinking', 'Data interpretation', 'Application skills'],
              tips: ['Focus on actionable metrics', 'Track trends', 'Combine with intuition'],
              commonMistakes: ['Over-analyzing', 'Ignoring context', 'Paralysis by analysis'],
              relatedDrills: ['Performance Tracking', 'Data Analysis', 'Metric Application'],
              videoReferences: ['Basketball Analytics', 'Performance Metrics'],
              estimatedTime: 45,
              difficulty: 'ADVANCED',
              type: 'ANALYTICS',
              targetValue: 20,
              targetUnit: 'metrics tracked',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g8',
              name: 'International Style',
              description: 'Master international basketball concepts',
              detailedDescription: 'Understand and incorporate international basketball styles and strategies, expanding your game beyond traditional approaches.',
              instructions: [
                'Study international basketball',
                'Learn different playing styles',
                'Adapt to various rules',
                'Understand global strategies',
                'Practice international concepts',
                'Appreciate diverse approaches',
                'Integrate best elements'
              ],
              skillRequirements: ['Adaptability', 'Open mindset', 'Strategic thinking'],
              tips: ['Embrace different styles', 'Learn from all cultures', 'Stay adaptable'],
              commonMistakes: ['Narrow thinking', 'Resistance to change', 'Cultural bias'],
              relatedDrills: ['International Concepts', 'Style Adaptation', 'Global Strategies'],
              videoReferences: ['International Basketball', 'Global Playing Styles'],
              estimatedTime: 60,
              difficulty: 'ADVANCED',
              type: 'STRATEGY',
              targetValue: 5,
              targetUnit: 'international concepts learned',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g9',
              name: 'Superstar Responsibility',
              description: 'Embrace the responsibilities of stardom',
              detailedDescription: 'Understand and embrace the responsibilities that come with being a superstar athlete, including community impact and role model duties.',
              instructions: [
                'Understand your platform',
                'Engage with community',
                'Be a positive role model',
                'Support youth development',
                'Give back to the sport',
                'Use influence responsibly',
                'Inspire the next generation'
              ],
              skillRequirements: ['Social awareness', 'Responsibility', 'Leadership'],
              tips: ['Lead by example', 'Stay humble', 'Make a difference'],
              commonMistakes: ['Ignoring influence', 'Poor role modeling', 'Selfish behavior'],
              relatedDrills: ['Community Engagement', 'Youth Mentoring', 'Leadership Development'],
              videoReferences: ['Athlete Responsibility', 'Community Impact'],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'SOCIAL',
              targetValue: 5,
              targetUnit: 'community activities',
              points: 40,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l7g10',
              name: 'Superstar Level Test',
              description: 'Demonstrate superstar-level mastery',
              detailedDescription: 'Complete a comprehensive evaluation demonstrating all superstar-level skills including clutch performance, leadership, and complete game mastery.',
              instructions: [
                'Demonstrate clutch performance',
                'Show advanced court vision',
                'Execute signature moves',
                'Display elite conditioning',
                'Handle media professionally',
                'Show championship mindset',
                'Apply analytics knowledge',
                'Demonstrate international concepts',
                'Show superstar responsibility',
                'Prove complete mastery'
              ],
              skillRequirements: ['All superstar skills', 'Complete mastery', 'Consistent excellence'],
              tips: ['Show everything you\'ve learned', 'Stay composed', 'Demonstrate leadership'],
              commonMistakes: ['Trying too hard', 'Forgetting fundamentals', 'Lack of confidence'],
              relatedDrills: ['Comprehensive Assessment', 'Superstar Evaluation', 'Complete Game Test'],
              videoReferences: ['Superstar Assessment', 'Complete Evaluation'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'ASSESSMENT',
              targetValue: 1,
              targetUnit: 'superstar test passed',
              points: 40,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        },
        // Level 8: MVP Player
        {
          id: 'level-8',
          levelNumber: 8,
          name: 'MVP Player',
          description: 'Reach Most Valuable Player status',
          pointsRequired: 1750,
          badgeIcon: '🏆',
          badgeColor: '#DC2626',
          rewards: ['MVP training', 'Elite recognition', 'Legacy building'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l8g1',
              name: 'Statistical Excellence',
              description: 'Achieve MVP-level statistics',
              detailedDescription: 'Consistently produce elite statistical performances across all major categories, demonstrating complete dominance and value to your team.',
              instructions: [
                'Track all major statistics',
                'Set elite performance targets',
                'Achieve consistent excellence',
                'Dominate multiple categories',
                'Impact winning significantly',
                'Maintain high efficiency',
                'Lead league in key metrics'
              ],
              skillRequirements: ['Complete skill set', 'Consistency', 'Elite performance'],
              tips: ['Focus on efficiency', 'Impact winning', 'Stay consistent'],
              commonMistakes: ['Stat hunting', 'Ignoring team success', 'Inconsistency'],
              relatedDrills: ['Statistical Tracking', 'Performance Optimization', 'Efficiency Training'],
              videoReferences: ['MVP Statistics', 'Elite Performance'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'PERFORMANCE',
              targetValue: 25,
              targetUnit: 'elite games',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g2',
              name: 'Team Elevation',
              description: 'Make teammates significantly better',
              detailedDescription: 'Demonstrate the ability to elevate teammates\' performance and make the entire team better through leadership, playmaking, and positive influence.',
              instructions: [
                'Study teammate strengths',
                'Create scoring opportunities',
                'Provide leadership guidance',
                'Boost team morale',
                'Develop team chemistry',
                'Maximize role players',
                'Build winning culture'
              ],
              skillRequirements: ['Leadership', 'Basketball IQ', 'Emotional intelligence'],
              tips: ['Know your teammates', 'Lead by example', 'Stay positive'],
              commonMistakes: ['Doing too much', 'Ignoring role players', 'Poor communication'],
              relatedDrills: ['Team Building', 'Leadership Exercises', 'Chemistry Development'],
              videoReferences: ['Team Leadership', 'Elevating Teammates'],
              estimatedTime: 75,
              difficulty: 'EXPERT',
              type: 'LEADERSHIP',
              targetValue: 15,
              targetUnit: 'teammates improved',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g3',
              name: 'Clutch Mastery',
              description: 'Dominate in the most crucial moments',
              detailedDescription: 'Become the go-to player in crucial moments, consistently delivering when the game and season are on the line.',
              instructions: [
                'Master pressure situations',
                'Develop ice-cold composure',
                'Execute under extreme pressure',
                'Make game-winning plays',
                'Handle elimination games',
                'Deliver in playoffs',
                'Become clutch legend'
              ],
              skillRequirements: ['Mental toughness', 'Pressure experience', 'Skill execution'],
              tips: ['Embrace pressure', 'Trust your training', 'Stay composed'],
              commonMistakes: ['Overthinking', 'Avoiding responsibility', 'Changing approach'],
              relatedDrills: ['Clutch Scenarios', 'Pressure Training', 'Game Winners'],
              videoReferences: ['Clutch Mastery', 'Pressure Performance'],
              estimatedTime: 60,
              difficulty: 'EXPERT',
              type: 'CLUTCH',
              targetValue: 20,
              targetUnit: 'clutch moments delivered',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g4',
              name: 'Defensive Impact',
              description: 'Become an elite two-way player',
              detailedDescription: 'Demonstrate elite defensive capabilities that complement offensive excellence, becoming a complete two-way player.',
              instructions: [
                'Master all defensive positions',
                'Anchor team defense',
                'Create defensive plays',
                'Disrupt opponent offense',
                'Protect the rim effectively',
                'Guard multiple positions',
                'Lead defensive communication'
              ],
              skillRequirements: ['Defensive IQ', 'Athletic ability', 'Communication'],
              tips: ['Defense wins championships', 'Anticipate plays', 'Communicate constantly'],
              commonMistakes: ['Focusing only on offense', 'Poor communication', 'Gambling too much'],
              relatedDrills: ['Defensive Positioning', 'Help Defense', 'Communication Drills'],
              videoReferences: ['Elite Defense', 'Two-Way Excellence'],
              estimatedTime: 80,
              difficulty: 'EXPERT',
              type: 'DEFENSE',
              targetValue: 3,
              targetUnit: 'defensive player awards',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g5',
              name: 'Playoff Dominance',
              description: 'Excel in playoff basketball',
              detailedDescription: 'Demonstrate the ability to elevate performance in playoff basketball, where the intensity and stakes are highest.',
              instructions: [
                'Raise performance in playoffs',
                'Handle increased pressure',
                'Adapt to playoff intensity',
                'Execute in crucial series',
                'Lead team through adversity',
                'Deliver signature performances',
                'Build playoff legacy'
              ],
              skillRequirements: ['Playoff experience', 'Mental toughness', 'Adaptability'],
              tips: ['Embrace the moment', 'Stay focused', 'Raise your level'],
              commonMistakes: ['Overthinking', 'Changing style', 'Feeling pressure'],
              relatedDrills: ['Playoff Simulation', 'Intensity Training', 'Pressure Scenarios'],
              videoReferences: ['Playoff Excellence', 'Postseason Performance'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'PLAYOFF',
              targetValue: 10,
              targetUnit: 'playoff series won',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g6',
              name: 'MVP Voting',
              description: 'Receive MVP consideration',
              detailedDescription: 'Perform at a level that garners serious MVP consideration from media, peers, and fans through sustained excellence.',
              instructions: [
                'Maintain elite performance',
                'Impact team success significantly',
                'Demonstrate complete game',
                'Show consistent excellence',
                'Lead in multiple categories',
                'Gain media recognition',
                'Earn peer respect'
              ],
              skillRequirements: ['Elite performance', 'Consistency', 'Leadership'],
              tips: ['Focus on winning', 'Stay consistent', 'Let performance speak'],
              commonMistakes: ['Stat hunting', 'Ignoring team', 'Inconsistency'],
              relatedDrills: ['Performance Consistency', 'Complete Game', 'Excellence Training'],
              videoReferences: ['MVP Performance', 'Elite Consistency'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'RECOGNITION',
              targetValue: 1,
              targetUnit: 'MVP consideration',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g7',
              name: 'League Leadership',
              description: 'Lead the league in key categories',
              detailedDescription: 'Achieve league leadership in one or more major statistical categories, demonstrating dominance in specific areas.',
              instructions: [
                'Identify target categories',
                'Develop specialized skills',
                'Maintain consistency',
                'Track league standings',
                'Optimize performance',
                'Sustain excellence',
                'Achieve league leadership'
              ],
              skillRequirements: ['Specialized excellence', 'Consistency', 'Competitive drive'],
              tips: ['Pick your battles', 'Stay consistent', 'Focus on strengths'],
              commonMistakes: ['Spreading too thin', 'Inconsistency', 'Ignoring team needs'],
              relatedDrills: ['Specialized Training', 'Consistency Work', 'Performance Optimization'],
              videoReferences: ['League Leadership', 'Statistical Dominance'],
              estimatedTime: 75,
              difficulty: 'EXPERT',
              type: 'STATISTICAL',
              targetValue: 2,
              targetUnit: 'league leading categories',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g8',
              name: 'Global Recognition',
              description: 'Achieve international basketball recognition',
              detailedDescription: 'Gain recognition as one of the world\'s best players through international competition and global basketball impact.',
              instructions: [
                'Compete internationally',
                'Represent country with honor',
                'Adapt to international play',
                'Build global reputation',
                'Inspire worldwide',
                'Master different styles',
                'Become global ambassador'
              ],
              skillRequirements: ['International experience', 'Adaptability', 'Global mindset'],
              tips: ['Embrace different styles', 'Represent well', 'Learn from others'],
              commonMistakes: ['Narrow focus', 'Cultural insensitivity', 'Lack of adaptation'],
              relatedDrills: ['International Training', 'Cultural Adaptation', 'Global Strategies'],
              videoReferences: ['International Basketball', 'Global Recognition'],
              estimatedTime: 60,
              difficulty: 'ADVANCED',
              type: 'INTERNATIONAL',
              targetValue: 3,
              targetUnit: 'international tournaments',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g9',
              name: 'MVP Mentality',
              description: 'Develop true MVP mindset',
              detailedDescription: 'Cultivate the mental approach and mindset that defines MVP-level players, focusing on excellence and team success.',
              instructions: [
                'Embrace MVP responsibility',
                'Maintain high standards',
                'Lead by example always',
                'Handle success humbly',
                'Stay motivated',
                'Inspire others',
                'Never settle'
              ],
              skillRequirements: ['Mental strength', 'Leadership', 'Humility'],
              tips: ['Stay humble', 'Lead by example', 'Keep improving'],
              commonMistakes: ['Ego inflation', 'Complacency', 'Losing focus'],
              relatedDrills: ['Mental Training', 'Leadership Development', 'Character Building'],
              videoReferences: ['MVP Mindset', 'Elite Mentality'],
              estimatedTime: 45,
              difficulty: 'EXPERT',
              type: 'MENTAL',
              targetValue: 1,
              targetUnit: 'MVP mindset achieved',
              points: 45,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l8g10',
              name: 'MVP Level Test',
              description: 'Demonstrate MVP-level mastery',
              detailedDescription: 'Complete a comprehensive evaluation demonstrating all MVP-level capabilities including statistical excellence, leadership, and complete game mastery.',
              instructions: [
                'Show statistical excellence',
                'Demonstrate team elevation',
                'Execute clutch mastery',
                'Display defensive impact',
                'Prove playoff dominance',
                'Earn MVP consideration',
                'Show league leadership',
                'Demonstrate global recognition',
                'Display MVP mentality',
                'Prove complete mastery'
              ],
              skillRequirements: ['All MVP skills', 'Complete mastery', 'Sustained excellence'],
              tips: ['Show complete game', 'Stay composed', 'Demonstrate leadership'],
              commonMistakes: ['Trying too hard', 'Forgetting teammates', 'Lack of composure'],
              relatedDrills: ['MVP Assessment', 'Complete Evaluation', 'Excellence Test'],
              videoReferences: ['MVP Assessment', 'Complete Mastery'],
              estimatedTime: 150,
              difficulty: 'EXPERT',
              type: 'ASSESSMENT',
              targetValue: 1,
              targetUnit: 'MVP test passed',
              points: 45,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        },
        // Level 9: Hall of Fame Player
        {
          id: 'level-9',
          levelNumber: 9,
          name: 'Hall of Fame Player',
          description: 'Achieve Hall of Fame greatness',
          pointsRequired: 2200,
          badgeIcon: '🎖️',
          badgeColor: '#8B5CF6',
          rewards: ['Hall of Fame recognition', 'Legacy immortality', 'Greatest of all time status'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l9g1',
              name: 'Career Longevity',
              description: 'Maintain excellence over long career',
              detailedDescription: 'Demonstrate sustained excellence over an extended career, showing the ability to adapt and remain elite as the game evolves.',
              instructions: [
                'Maintain peak performance',
                'Adapt to game changes',
                'Preserve body through training',
                'Evolve skill set over time',
                'Handle aging gracefully',
                'Mentor younger players',
                'Sustain motivation'
              ],
              skillRequirements: ['Longevity', 'Adaptability', 'Physical maintenance'],
              tips: ['Take care of your body', 'Keep evolving', 'Stay motivated'],
              commonMistakes: ['Ignoring body care', 'Resisting change', 'Losing motivation'],
              relatedDrills: ['Longevity Training', 'Adaptation Exercises', 'Maintenance Routines'],
              videoReferences: ['Career Longevity', 'Sustained Excellence'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'LONGEVITY',
              targetValue: 15,
              targetUnit: 'elite seasons',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g2',
              name: 'Championship Legacy',
              description: 'Win multiple championships',
              detailedDescription: 'Build a championship legacy by winning multiple titles and being the key contributor to championship teams.',
              instructions: [
                'Lead championship teams',
                'Perform in Finals',
                'Make championship plays',
                'Handle championship pressure',
                'Build winning culture',
                'Inspire championship runs',
                'Create championship legacy'
              ],
              skillRequirements: ['Championship experience', 'Leadership', 'Clutch performance'],
              tips: ['Championships define greatness', 'Lead by example', 'Embrace pressure'],
              commonMistakes: ['Individual focus', 'Pressure avoidance', 'Poor leadership'],
              relatedDrills: ['Championship Preparation', 'Finals Training', 'Legacy Building'],
              videoReferences: ['Championship Legacy', 'Finals Excellence'],
              estimatedTime: 180,
              difficulty: 'EXPERT',
              type: 'CHAMPIONSHIP',
              targetValue: 3,
              targetUnit: 'championships won',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g3',
              name: 'Record Breaking',
              description: 'Set and break significant records',
              detailedDescription: 'Achieve record-breaking performances that place you among the all-time greats in basketball history.',
              instructions: [
                'Identify record opportunities',
                'Develop specialized skills',
                'Maintain consistency',
                'Track record progress',
                'Execute record attempts',
                'Break significant records',
                'Set new standards'
              ],
              skillRequirements: ['Elite performance', 'Consistency', 'Record awareness'],
              tips: ['Focus on meaningful records', 'Stay consistent', 'Seize opportunities'],
              commonMistakes: ['Chasing empty records', 'Inconsistency', 'Missing opportunities'],
              relatedDrills: ['Record Training', 'Consistency Work', 'Performance Optimization'],
              videoReferences: ['Record Breaking', 'Historic Performances'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'RECORDS',
              targetValue: 5,
              targetUnit: 'significant records',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g4',
              name: 'Generational Impact',
              description: 'Influence entire generation of players',
              detailedDescription: 'Make such a significant impact that you influence how an entire generation of players approaches the game.',
              instructions: [
                'Innovate playing style',
                'Inspire young players',
                'Change game approach',
                'Set new standards',
                'Influence basketball culture',
                'Mentor future stars',
                'Leave lasting impact'
              ],
              skillRequirements: ['Innovation', 'Influence', 'Cultural impact'],
              tips: ['Be innovative', 'Inspire others', 'Think beyond yourself'],
              commonMistakes: ['Narrow focus', 'Ignoring influence', 'Lack of innovation'],
              relatedDrills: ['Innovation Training', 'Influence Development', 'Cultural Impact'],
              videoReferences: ['Generational Impact', 'Basketball Innovation'],
              estimatedTime: 75,
              difficulty: 'EXPERT',
              type: 'INFLUENCE',
              targetValue: 1,
              targetUnit: 'generational impact achieved',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g5',
              name: 'All-Time Rankings',
              description: 'Achieve all-time great status',
              detailedDescription: 'Perform at a level that places you in discussions of the greatest players of all time across multiple categories.',
              instructions: [
                'Achieve elite career statistics',
                'Rank among all-time leaders',
                'Demonstrate complete greatness',
                'Earn historical recognition',
                'Compare to legends',
                'Secure all-time status',
                'Join elite company'
              ],
              skillRequirements: ['Historical excellence', 'Complete greatness', 'Sustained performance'],
              tips: ['Think historically', 'Maintain excellence', 'Earn your place'],
              commonMistakes: ['Short-term thinking', 'Inconsistency', 'Lack of completeness'],
              relatedDrills: ['Historical Training', 'Greatness Development', 'Legacy Building'],
              videoReferences: ['All-Time Greatness', 'Historical Rankings'],
              estimatedTime: 100,
              difficulty: 'EXPERT',
              type: 'HISTORICAL',
              targetValue: 5,
              targetUnit: 'all-time rankings',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g6',
              name: 'Cultural Icon',
              description: 'Become a cultural icon beyond basketball',
              detailedDescription: 'Transcend basketball to become a cultural icon whose influence extends far beyond the sport.',
              instructions: [
                'Build global brand',
                'Influence popular culture',
                'Engage in social causes',
                'Inspire beyond basketball',
                'Create cultural moments',
                'Build lasting legacy',
                'Transcend the sport'
              ],
              skillRequirements: ['Cultural awareness', 'Global influence', 'Social impact'],
              tips: ['Think beyond basketball', 'Use platform wisely', 'Create positive impact'],
              commonMistakes: ['Narrow focus', 'Ignoring influence', 'Wasting platform'],
              relatedDrills: ['Cultural Development', 'Brand Building', 'Social Impact'],
              videoReferences: ['Cultural Impact', 'Global Influence'],
              estimatedTime: 60,
              difficulty: 'ADVANCED',
              type: 'CULTURAL',
              targetValue: 1,
              targetUnit: 'cultural icon status',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g7',
              name: 'Coaching Excellence',
              description: 'Develop coaching and mentoring abilities',
              detailedDescription: 'Develop the ability to teach and mentor others, sharing your knowledge and helping develop the next generation.',
              instructions: [
                'Study coaching principles',
                'Develop teaching skills',
                'Mentor young players',
                'Share basketball knowledge',
                'Build coaching philosophy',
                'Help others improve',
                'Prepare for post-playing career'
              ],
              skillRequirements: ['Teaching ability', 'Patience', 'Communication'],
              tips: ['Be patient', 'Share knowledge', 'Develop others'],
              commonMistakes: ['Impatience', 'Poor communication', 'Selfish approach'],
              relatedDrills: ['Coaching Development', 'Teaching Skills', 'Mentoring Practice'],
              videoReferences: ['Coaching Excellence', 'Player Development'],
              estimatedTime: 45,
              difficulty: 'INTERMEDIATE',
              type: 'COACHING',
              targetValue: 10,
              targetUnit: 'players mentored',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g8',
              name: 'Hall of Fame Credentials',
              description: 'Build Hall of Fame worthy resume',
              detailedDescription: 'Accumulate the achievements, statistics, and accolades that make you a lock for Hall of Fame induction.',
              instructions: [
                'Achieve major awards',
                'Accumulate elite statistics',
                'Win championships',
                'Earn All-Star selections',
                'Receive individual honors',
                'Build complete resume',
                'Secure Hall of Fame status'
              ],
              skillRequirements: ['Complete excellence', 'Achievement accumulation', 'Sustained greatness'],
              tips: ['Focus on meaningful achievements', 'Stay consistent', 'Build complete resume'],
              commonMistakes: ['Focusing on empty stats', 'Inconsistency', 'Incomplete resume'],
              relatedDrills: ['Achievement Tracking', 'Excellence Maintenance', 'Resume Building'],
              videoReferences: ['Hall of Fame Credentials', 'Achievement Excellence'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'ACHIEVEMENT',
              targetValue: 20,
              targetUnit: 'major achievements',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g9',
              name: 'Legacy Planning',
              description: 'Plan and build lasting legacy',
              detailedDescription: 'Actively plan and build a lasting legacy that will endure long after your playing career ends.',
              instructions: [
                'Define desired legacy',
                'Plan legacy activities',
                'Build foundations',
                'Create lasting impact',
                'Document achievements',
                'Inspire future generations',
                'Secure immortality'
              ],
              skillRequirements: ['Long-term thinking', 'Legacy planning', 'Impact creation'],
              tips: ['Think long-term', 'Plan carefully', 'Create lasting impact'],
              commonMistakes: ['Short-term focus', 'Poor planning', 'Ignoring legacy'],
              relatedDrills: ['Legacy Planning', 'Impact Creation', 'Future Thinking'],
              videoReferences: ['Legacy Building', 'Lasting Impact'],
              estimatedTime: 30,
              difficulty: 'INTERMEDIATE',
              type: 'LEGACY',
              targetValue: 1,
              targetUnit: 'legacy plan created',
              points: 50,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l9g10',
              name: 'Hall of Fame Level Test',
              description: 'Demonstrate Hall of Fame level mastery',
              detailedDescription: 'Complete a comprehensive evaluation demonstrating all Hall of Fame level capabilities including career longevity, championship legacy, and historical greatness.',
              instructions: [
                'Show career longevity',
                'Demonstrate championship legacy',
                'Prove record breaking ability',
                'Display generational impact',
                'Show all-time rankings',
                'Demonstrate cultural icon status',
                'Prove coaching excellence',
                'Show Hall of Fame credentials',
                'Display legacy planning',
                'Prove complete greatness'
              ],
              skillRequirements: ['All Hall of Fame skills', 'Complete greatness', 'Historical excellence'],
              tips: ['Show complete greatness', 'Demonstrate impact', 'Prove historical significance'],
              commonMistakes: ['Incomplete demonstration', 'Lack of impact', 'Missing historical context'],
              relatedDrills: ['Hall of Fame Assessment', 'Greatness Evaluation', 'Historical Test'],
              videoReferences: ['Hall of Fame Assessment', 'Complete Greatness'],
              estimatedTime: 180,
              difficulty: 'EXPERT',
              type: 'ASSESSMENT',
              targetValue: 1,
              targetUnit: 'Hall of Fame test passed',
              points: 50,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        },
        // Level 10: Basketball Legend
        {
          id: 'level-10',
          levelNumber: 10,
          name: 'Basketball Legend',
          description: 'Achieve legendary status - the ultimate basketball mastery',
          pointsRequired: 2700,
          badgeIcon: '🐐',
          badgeColor: '#1F2937',
          rewards: ['Legendary status', 'GOAT consideration', 'Immortal legacy'],
          userProgress: {
            status: 'LOCKED',
            progress: 0,
            completedGoals: 0,
            totalGoals: 10,
            totalPoints: 0
          },
          goals: [
            {
              id: 'l10g1',
              name: 'GOAT Discussion',
              description: 'Enter Greatest of All Time discussions',
              detailedDescription: 'Achieve a level of excellence that places you in legitimate discussions as the Greatest of All Time in basketball.',
              instructions: [
                'Achieve unparalleled excellence',
                'Dominate multiple eras',
                'Set unbreakable records',
                'Win multiple championships',
                'Influence the game forever',
                'Earn universal respect',
                'Join GOAT conversation'
              ],
              skillRequirements: ['Unparalleled excellence', 'Complete dominance', 'Historical impact'],
              tips: ['Strive for perfection', 'Dominate completely', 'Think historically'],
              commonMistakes: ['Settling for great', 'Incomplete dominance', 'Ignoring history'],
              relatedDrills: ['GOAT Training', 'Excellence Mastery', 'Historical Dominance'],
              videoReferences: ['GOAT Discussion', 'Ultimate Excellence'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'GOAT',
              targetValue: 1,
              targetUnit: 'GOAT status achieved',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g2',
              name: 'Unbreakable Records',
              description: 'Set records that may never be broken',
              detailedDescription: 'Achieve such extraordinary feats that your records become the stuff of legend and may never be surpassed.',
              instructions: [
                'Identify legendary opportunities',
                'Push beyond human limits',
                'Execute impossible feats',
                'Set unthinkable records',
                'Achieve the impossible',
                'Create legendary moments',
                'Establish eternal standards'
              ],
              skillRequirements: ['Superhuman ability', 'Impossible execution', 'Legendary performance'],
              tips: ['Push all limits', 'Achieve the impossible', 'Create history'],
              commonMistakes: ['Accepting limits', 'Settling for possible', 'Thinking small'],
              relatedDrills: ['Limit Breaking', 'Impossible Training', 'Legendary Practice'],
              videoReferences: ['Unbreakable Records', 'Legendary Feats'],
              estimatedTime: 150,
              difficulty: 'EXPERT',
              type: 'LEGENDARY',
              targetValue: 3,
              targetUnit: 'unbreakable records',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g3',
              name: 'Perfect Game',
              description: 'Achieve basketball perfection',
              detailedDescription: 'Play a perfect game where every aspect of basketball is executed flawlessly, creating a legendary performance.',
              instructions: [
                'Master every fundamental',
                'Execute flawless technique',
                'Make perfect decisions',
                'Achieve 100% efficiency',
                'Control every possession',
                'Dominate completely',
                'Create perfection'
              ],
              skillRequirements: ['Perfect technique', 'Flawless execution', 'Complete mastery'],
              tips: ['Strive for perfection', 'Execute flawlessly', 'Control everything'],
              commonMistakes: ['Accepting imperfection', 'Sloppy execution', 'Losing focus'],
              relatedDrills: ['Perfection Training', 'Flawless Execution', 'Complete Control'],
              videoReferences: ['Perfect Game', 'Flawless Performance'],
              estimatedTime: 180,
              difficulty: 'EXPERT',
              type: 'PERFECTION',
              targetValue: 1,
              targetUnit: 'perfect game achieved',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g4',
              name: 'Game Revolution',
              description: 'Revolutionize how basketball is played',
              detailedDescription: 'Create such innovative approaches to basketball that you fundamentally change how the game is played for generations.',
              instructions: [
                'Identify game limitations',
                'Develop revolutionary concepts',
                'Test innovative approaches',
                'Prove new methods',
                'Influence rule changes',
                'Change basketball forever',
                'Create new era'
              ],
              skillRequirements: ['Revolutionary thinking', 'Innovation mastery', 'Game-changing ability'],
              tips: ['Think revolutionarily', 'Challenge everything', 'Change the game'],
              commonMistakes: ['Conventional thinking', 'Resisting change', 'Small innovations'],
              relatedDrills: ['Revolutionary Training', 'Innovation Development', 'Game Changing'],
              videoReferences: ['Game Revolution', 'Basketball Innovation'],
              estimatedTime: 90,
              difficulty: 'EXPERT',
              type: 'REVOLUTION',
              targetValue: 1,
              targetUnit: 'game revolution created',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g5',
              name: 'Immortal Legacy',
              description: 'Create a truly immortal legacy',
              detailedDescription: 'Build a legacy so powerful and enduring that it becomes immortal, inspiring generations of players forever.',
              instructions: [
                'Define immortal vision',
                'Create lasting institutions',
                'Inspire infinite generations',
                'Build eternal monuments',
                'Establish timeless principles',
                'Create immortal impact',
                'Achieve true immortality'
              ],
              skillRequirements: ['Immortal vision', 'Eternal impact', 'Timeless influence'],
              tips: ['Think eternally', 'Create lasting impact', 'Inspire forever'],
              commonMistakes: ['Temporary thinking', 'Limited impact', 'Finite vision'],
              relatedDrills: ['Immortal Planning', 'Eternal Impact', 'Timeless Creation'],
              videoReferences: ['Immortal Legacy', 'Eternal Greatness'],
              estimatedTime: 60,
              difficulty: 'EXPERT',
              type: 'IMMORTAL',
              targetValue: 1,
              targetUnit: 'immortal legacy created',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g6',
              name: 'Universal Inspiration',
              description: 'Inspire people beyond basketball',
              detailedDescription: 'Become such an inspirational figure that your influence extends far beyond basketball, inspiring people in all walks of life.',
              instructions: [
                'Transcend basketball completely',
                'Inspire all humanity',
                'Create universal messages',
                'Build global movement',
                'Influence all sports',
                'Inspire life principles',
                'Become universal symbol'
              ],
              skillRequirements: ['Universal appeal', 'Global influence', 'Inspirational power'],
              tips: ['Think universally', 'Inspire everyone', 'Transcend boundaries'],
              commonMistakes: ['Limited thinking', 'Narrow appeal', 'Sport-specific focus'],
              relatedDrills: ['Universal Training', 'Global Inspiration', 'Transcendent Practice'],
              videoReferences: ['Universal Inspiration', 'Global Impact'],
              estimatedTime: 45,
              difficulty: 'ADVANCED',
              type: 'UNIVERSAL',
              targetValue: 1,
              targetUnit: 'universal inspiration achieved',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g7',
              name: 'Mythical Status',
              description: 'Achieve mythical legendary status',
              detailedDescription: 'Perform feats so extraordinary that they become the stuff of myth and legend, transcending normal human achievement.',
              instructions: [
                'Achieve impossible feats',
                'Create mythical moments',
                'Transcend human limits',
                'Become living legend',
                'Inspire mythical stories',
                'Achieve superhuman status',
                'Enter mythology'
              ],
              skillRequirements: ['Mythical ability', 'Superhuman performance', 'Legendary status'],
              tips: ['Achieve the impossible', 'Create myths', 'Transcend humanity'],
              commonMistakes: ['Accepting limitations', 'Staying human', 'Avoiding myths'],
              relatedDrills: ['Mythical Training', 'Superhuman Development', 'Legend Creation'],
              videoReferences: ['Mythical Status', 'Legendary Transcendence'],
              estimatedTime: 120,
              difficulty: 'EXPERT',
              type: 'MYTHICAL',
              targetValue: 1,
              targetUnit: 'mythical status achieved',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g8',
              name: 'Eternal Recognition',
              description: 'Achieve recognition that lasts forever',
              detailedDescription: 'Gain recognition and honor that will endure for all time, ensuring your greatness is never forgotten.',
              instructions: [
                'Achieve timeless greatness',
                'Create eternal monuments',
                'Build lasting institutions',
                'Inspire infinite generations',
                'Establish eternal standards',
                'Create immortal recognition',
                'Achieve forever status'
              ],
              skillRequirements: ['Eternal greatness', 'Timeless impact', 'Immortal recognition'],
              tips: ['Think eternally', 'Create forever', 'Build immortally'],
              commonMistakes: ['Temporary focus', 'Limited recognition', 'Finite thinking'],
              relatedDrills: ['Eternal Training', 'Forever Development', 'Immortal Practice'],
              videoReferences: ['Eternal Recognition', 'Forever Greatness'],
              estimatedTime: 75,
              difficulty: 'EXPERT',
              type: 'ETERNAL',
              targetValue: 1,
              targetUnit: 'eternal recognition achieved',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g9',
              name: 'Complete Mastery',
              description: 'Achieve complete mastery of basketball',
              detailedDescription: 'Reach a level of complete mastery where every aspect of basketball has been perfected and transcended.',
              instructions: [
                'Master every skill perfectly',
                'Transcend all limitations',
                'Achieve complete understanding',
                'Perfect every technique',
                'Master all aspects',
                'Achieve total mastery',
                'Transcend the game'
              ],
              skillRequirements: ['Complete mastery', 'Perfect technique', 'Total understanding'],
              tips: ['Master everything', 'Perfect all skills', 'Transcend limitations'],
              commonMistakes: ['Incomplete mastery', 'Imperfect technique', 'Limited understanding'],
              relatedDrills: ['Complete Training', 'Perfect Practice', 'Total Mastery'],
              videoReferences: ['Complete Mastery', 'Perfect Basketball'],
              estimatedTime: 200,
              difficulty: 'EXPERT',
              type: 'MASTERY',
              targetValue: 1,
              targetUnit: 'complete mastery achieved',
              points: 100,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            },
            {
              id: 'l10g10',
              name: 'Basketball Legend Test',
              description: 'Demonstrate ultimate basketball legend mastery',
              detailedDescription: 'Complete the ultimate evaluation demonstrating legendary status including GOAT discussion, unbreakable records, and complete transcendence of the game.',
              instructions: [
                'Demonstrate GOAT status',
                'Show unbreakable records',
                'Prove perfect game ability',
                'Display game revolution',
                'Show immortal legacy',
                'Demonstrate universal inspiration',
                'Prove mythical status',
                'Show eternal recognition',
                'Display complete mastery',
                'Achieve legendary transcendence'
              ],
              skillRequirements: ['All legendary skills', 'Complete transcendence', 'Ultimate mastery'],
              tips: ['Show ultimate greatness', 'Demonstrate transcendence', 'Prove legendary status'],
              commonMistakes: ['Incomplete demonstration', 'Lack of transcendence', 'Missing legendary elements'],
              relatedDrills: ['Legend Assessment', 'Ultimate Evaluation', 'Transcendence Test'],
              videoReferences: ['Legend Assessment', 'Ultimate Mastery'],
              estimatedTime: 240,
              difficulty: 'EXPERT',
              type: 'ASSESSMENT',
              targetValue: 1,
              targetUnit: 'legend test passed',
              points: 100,
              isLevelTest: true,
              personalNotes: '',
              customCriteria: '',
              userProgress: { status: 'LOCKED', progress: 0, currentValue: 0, attempts: 0 }
            }
          ]
        }
      ];

      return NextResponse.json(mockLevels);
    }

    // Real database implementation would go here
    
    // Fetch levels from database
    const levels = await prisma.level.findMany({
      include: {
        goals: {
          include: {
            userGoals: {
              where: { userId },
              take: 1
            }
          }
        },
        userLevels: {
          where: { userId },
          take: 1
        }
      },
      orderBy: { levelNumber: 'asc' }
    });

    return NextResponse.json(levels);
  } catch (error) {
    logger.error('Error fetching levels', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

// POST endpoint for updating goals
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { goalId, goalData } = body;

    // Update goal in database
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        name: goalData.name,
        description: goalData.description,
        points: goalData.points,
                // Add other fields as needed
      }
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    logger.error('Error updating goal', error as Error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}          