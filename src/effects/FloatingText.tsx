import React from 'react';
import { FloatingNotification } from '../types/game';

interface Props {
  notifications: FloatingNotification[];
}

export const FloatingTextOverlay: React.FC<Props> = ({ notifications }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
      {notifications.map((notif) => {
        const isCenter = !notif.x || !notif.y;
        const style: React.CSSProperties = isCenter
          ? {}
          : {
              position: 'absolute',
              left: `${notif.x}px`,
              top: `${notif.y}px`,
              transform: 'translate(-50%, -50%)',
            };

        let badgeClass =
          'font-display font-black tracking-wider uppercase text-center drop-shadow-[0_0_16px_rgba(0,0,0,0.8)] transition-all';
        let sizeClass = 'text-2xl sm:text-3xl';
        let textColor = notif.color || '#00f3ff';

        if (notif.type === 'combo') {
          sizeClass = 'text-3xl sm:text-4xl text-amber-400 drop-shadow-[0_0_20px_rgba(255,170,0,0.8)]';
        } else if (notif.type === 'mega') {
          sizeClass = 'text-4xl sm:text-5xl text-fuchsia-400 drop-shadow-[0_0_28px_rgba(217,70,239,0.9)]';
        } else if (notif.type === 'perfect') {
          sizeClass = 'text-4xl sm:text-6xl text-yellow-300 drop-shadow-[0_0_35px_rgba(255,215,0,1)]';
        } else if (notif.type === 'level') {
          sizeClass = 'text-3xl sm:text-4xl text-emerald-400 drop-shadow-[0_0_25px_rgba(0,255,136,0.9)]';
        }

        return (
          <div
            key={notif.id}
            style={style}
            className={`animate-float pointer-events-none select-none ${isCenter ? 'relative my-auto' : ''}`}
          >
            <div
              className={`${badgeClass} ${sizeClass}`}
              style={{ color: notif.color || textColor }}
            >
              {notif.text}
              {notif.subtext && (
                <div className="text-xs sm:text-sm font-semibold tracking-widest text-white/80 mt-1">
                  {notif.subtext}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
