/**
 * UI Components
 * 
 * This file exports all UI components for easy imports.
 * Components are organized by category for better discoverability.
 */

// Button components
export { Button, buttonVariants } from '@/app/_components/ui/button';
export { Toggle, toggleVariants } from '@/app/_components/ui/toggle';
export { ToggleGroup, ToggleGroupItem } from '@/app/_components/ui/toggle-group';

// Form components
export { Input } from '@/app/_components/ui/input';
export { Textarea } from '@/app/_components/ui/textarea';
export { Label } from '@/app/_components/ui/label';
export { Checkbox } from '@/app/_components/ui/checkbox';
export { RadioGroup, RadioGroupItem } from '@/app/_components/ui/radio-group';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select';
export { Slider } from '@/app/_components/ui/slider';
export { Switch } from '@/app/_components/ui/switch';
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/app/_components/ui/form';

// Layout components
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/_components/ui/card';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/app/_components/ui/table';
export { ScrollArea, ScrollBar } from '@/app/_components/ui/scroll-area';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs';
export { Separator } from '@/app/_components/ui/separator';
export { AspectRatio } from '@/app/_components/ui/aspect-ratio';
export { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/_components/ui/collapsible';
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/app/_components/ui/resizable';

// Navigation components
export { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/app/_components/ui/navigation-menu';
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/app/_components/ui/breadcrumb';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/app/_components/ui/pagination';

// Overlay components
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/_components/ui/dialog';
export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/app/_components/ui/drawer';
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/app/_components/ui/dropdown-menu';
export { Popover, PopoverContent, PopoverTrigger } from '@/app/_components/ui/popover';
export { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/_components/ui/hover-card';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/_components/ui/tooltip';
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/app/_components/ui/sheet';
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/app/_components/ui/alert-dialog';
export { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuPortal, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/app/_components/ui/context-menu';
export { Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarPortal, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/app/_components/ui/menubar';
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/app/_components/ui/command';

// Feedback components
export { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';
export { Progress } from '@/app/_components/ui/progress';
export { Skeleton } from '@/app/_components/ui/skeleton';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/app/_components/ui/toast';
export { Toaster } from '@/app/_components/ui/toaster';

// Data display components
export { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar';
export { Badge, badgeVariants } from '@/app/_components/ui/badge';
export { Calendar } from '@/app/_components/ui/calendar';
export { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/app/_components/ui/carousel';

// Special components
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/_components/ui/accordion';
export { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/_components/ui/input-otp';

// Import default exports and re-export them
import ThreeDots from '@/app/_components/ui/three-dots-wave';
export { ThreeDots };

export { Confetti } from '@/app/_components/ui/confetti';

import Transcriber from '@/app/_components/ui/transcriber';
export { Transcriber }; 