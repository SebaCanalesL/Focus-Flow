'use server';
/**
 * @fileOverview A flow for suggesting a relevant icon for a new habit.
 *
 * - suggestHabitIcon - A function that suggests an icon name from lucide-react.
 * - SuggestHabitIconInput - The input type for the suggestHabitIcon function.
 * - SuggestHabitIconOutput - The return type for the suggestHabitIcon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestHabitIconInputSchema = z.object({
  habitName: z.string().describe('The name of the habit for which to suggest an icon.'),
});
export type SuggestHabitIconInput = z.infer<typeof SuggestHabitIconInputSchema>;

const SuggestHabitIconOutputSchema = z.object({
  iconName: z.string().describe('The suggested icon name from the lucide-react library.'),
});
export type SuggestHabitIconOutput = z.infer<typeof SuggestHabitIconOutputSchema>;

// A curated list of lucide-react icons that are suitable for habits
const VALID_ICONS = [
    "Activity", "AlarmClock", "Award", "Apple", "Anchor",
    "Bed", "Bike", "BookOpen", "BrainCircuit", "Briefcase", "Brush", "Bell",
    "Calendar", "Camera", "Car", "Carrot", "CheckCircle2", "ClipboardList", "Clock", "Cloud", "Coffee", "Coin", "Computer", "Contact", "CreditCard", "Crown",
    "Dumbbell", "DollarSign", "Droplet",
    "Edit", "ExternalLink", "Eye",
    "Feather", "FileText", "Film", "Flag", "Flame", "Flower", "Folder", "Footprints",
    "GanttChartSquare", "GitFork", "Github", "Globe", "GraduationCap", "Grape",
    "HandHeart", "Heart", "Headphones", "Home", "Hourglass",
    "Image", "Inbox",
    "Key",
    "Laptop", "Laugh", "Leaf", "Lightbulb", "Link", "List", "Lock", "LogIn", "LogOut",
    "Mail", "Map", "Megaphone", "Menu", "MessageCircle", "Mic", "Moon", "MousePointer", "Move", "Music", "Medal",
    "Navigation", "Newspaper",
    "Palette", "Paperclip", "Pause", "PenTool", "Pencil", "Percent", "PersonStanding", "Phone", "PictureInPicture", "PiggyBank", "Play", "Presentation", "Puzzle", "Podcast",
    "Quote",

    "Receipt", "Repeat", "Reply", "Rocket", "RotateCw",
    "Save", "Scale", "Scissors", "ScreenShare", "Send", "Settings", "Share2", "Sheet", "Shield", "ShoppingBag", "ShoppingBasket", "ShoppingCart", "Smile", "Sparkles", "Speaker", "Star", "Sun", "Sunrise", "Sunset", "SwissFranc",
    "Table", "Tablet", "Tag", "Target", "Tent", "Terminal", "ThumbsUp", "Ticket", "Timer", "ToggleLeft", "Tool", "Trash2", "TrendingUp", "Trophy", "Tv", "Twitter",
    "Umbrella", "University", "User", "Users",
    "Video", "Voicemail", "Volume2",
    "Wallet", "Watch", "Wifi", "Wind", "Wine", "Wrench",
    "Youtube",
    "Zap"
];

export async function suggestHabitIcon(input: SuggestHabitIconInput): Promise<SuggestHabitIconOutput> {
  // Check if AI is available (has API key)
  const hasApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!hasApiKey) {
    console.warn('AI not available - returning default icon');
    return { iconName: 'Target' };
  }
  
  try {
    return await suggestHabitIconFlow(input);
  } catch (error) {
    console.warn('AI icon suggestion failed, using default:', error);
    return { iconName: 'Target' };
  }
}

const prompt = ai.definePrompt({
  name: 'suggestHabitIconPrompt',
  input: {schema: SuggestHabitIconInputSchema},
  output: {schema: SuggestHabitIconOutputSchema},
  prompt: `You are an icon suggestion expert. Your task is to suggest a relevant icon for a given habit name.
The icon must be a valid name from the lucide-react library.

Habit Name: {{{habitName}}}

Choose the most appropriate icon from the following list.
Return only the exact name of the icon. If no icon is a good fit, return "Target".

Valid Icons:
${VALID_ICONS.join(", ")}
`,
});

const suggestHabitIconFlow = ai.defineFlow(
  {
    name: 'suggestHabitIconFlow',
    inputSchema: SuggestHabitIconInputSchema,
    outputSchema: SuggestHabitIconOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !VALID_ICONS.includes(output.iconName)) {
        return { iconName: 'Target' };
    }
    return output;
  }
);
