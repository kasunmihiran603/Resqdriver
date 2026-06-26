import React from "react";
import { Check, Dot } from "lucide-react";

export const Timeline = ({ items = [] }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {items.map((item, itemIdx) => {
          const isCompleted = item.status === "completed";
          const isActive = item.status === "active";
          
          return (
            <li key={itemIdx}>
              <div className="relative pb-8">
                {itemIdx !== items.length - 1 ? (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      isCompleted ? "bg-primary" : "bg-border/60"
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-background ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isActive
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} className="stroke-[3]" />
                      ) : isActive ? (
                        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/45" />
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-muted-foreground/70">
                      <time dateTime={item.time}>{item.time}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
