
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Book, LogOut, Settings, User, BookOpen, ArrowLeftRight, PlusCircle, Database  } from "lucide-react";
import { usePaper } from "@/context/PaperContext";
import PaperSwitcher from "./PaperSwitcher";

const DashboardNav = () => {
  const { isAdmin } = useAuth();
  const [pending, setPending] = useState(false);
  const { currentUser, signOut } = useAuth();
  const { paperType } = usePaper();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      setPending(true);
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 font-bold text-white text-xl"
            >
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <span>
                Maggic<span className="text-indigo-400">Mock</span>
              </span>
            </Link>
            
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'text-indigo-300 bg-indigo-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/create-test"
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/create-test' 
                    ? 'text-indigo-300 bg-indigo-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="inline-block h-4 w-4 mr-1 mb-1" />
                Create Test
              </Link>
              {/* <Link 
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/profile' 
                    ? 'text-indigo-700 bg-indigo-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="inline-block h-4 w-4 mr-1" />
                Profile
              </Link> */}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-slate-300">
              {paperType || "Select Paper"}
            </div>
            
            <PaperSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-white/20 bg-white/5 hover:bg-white/10 text-white">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage
                      src={currentUser?.photoURL || ""}
                      alt={currentUser?.displayName || ""}
                    />
                    <AvatarFallback className="bg-indigo-900 text-indigo-200">
                      {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-slate-200">
                <DropdownMenuLabel className="text-slate-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-white">
                      <Database className="mr-2 h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Bhaiya Ji</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link to="/create-test">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800 focus:text-white">
                    <Book className="mr-2 h-4 w-4" />
                    <span>Create Test</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={pending}
                  className="cursor-pointer focus:bg-red-950 focus:text-red-400 text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{pending ? "Signing out..." : "Sign out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNav;

