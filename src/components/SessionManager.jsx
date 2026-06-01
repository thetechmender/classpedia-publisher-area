import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getSessionInfo, formatTimeRemaining, clearAuthAndRedirect } from '@/services/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * SessionManager Component
 * 
 * Monitors user session and provides warnings before token expiration.
 * Features:
 * - Checks session status every 30 seconds
 * - Shows warning dialog 5 minutes before expiry
 * - Auto-logout when token expires
 * - Tracks user activity
 */
export default function SessionManager() {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Check session status
  const checkSession = useCallback(() => {
    if (!isAuthenticated) return;

    const info = getSessionInfo();
    setSessionInfo(info);

    // If token expired, logout immediately
    if (!info.isActive) {
      logout(false);
      clearAuthAndRedirect('Your session has expired. Please log in again.');
      return;
    }

    // Show warning if expiring soon
    if (info.isExpiringSoon && !showWarning) {
      setShowWarning(true);
      setTimeRemaining(info.timeRemaining);
    }

    // Update time remaining if warning is shown
    if (showWarning) {
      setTimeRemaining(info.timeRemaining);
      
      // Auto-logout if time runs out
      if (info.timeRemaining <= 0) {
        handleLogout();
      }
    }
  }, [isAuthenticated, showWarning, logout]);

  // Handle user choosing to continue session
  const handleContinue = () => {
    setShowWarning(false);
    // In a real app, you might want to refresh the token here
    // For now, just close the dialog
  };

  // Handle user choosing to logout
  const handleLogout = () => {
    setShowWarning(false);
    logout(true);
  };

  // Set up session monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSession]);

  // Track user activity (mouse movement, keyboard, clicks)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      // Activity is tracked in api.ts updateLastActivity()
      // This just ensures we're listening for user interactions
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg">Session Expiring Soon</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed pt-2">
            Your session will expire in{' '}
            <span className="font-bold text-amber-600">
              {formatTimeRemaining(timeRemaining)}
            </span>
            . You'll be automatically logged out for security reasons.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-slate-50 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="space-y-1 text-xs">
                <li>• Click "Continue" to keep working (you may need to re-authenticate soon)</li>
                <li>• Click "Logout Now" to safely end your session</li>
                <li>• If no action is taken, you'll be logged out automatically</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel onClick={handleLogout} className="sm:w-auto">
            Logout Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue} className="sm:w-auto">
            Continue Working
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
