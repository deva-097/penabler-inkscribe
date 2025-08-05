import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { InkingEvent } from "@/types";
import { addMonths, subMonths, format, isSameDay } from "date-fns";

export const CalendarView = () => {
  const { inkingEvents, getPenById, getInkById } = useSupabaseData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const getEventsForDate = (date: Date): InkingEvent[] => {
    return inkingEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const getEventTypeColor = (eventType: InkingEvent['eventType']) => {
    switch (eventType) {
      case 'inked': return 'bg-blue-500';
      case 'cleaned': return 'bg-gray-500';
      case 're-inked': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (eventType: InkingEvent['eventType']) => {
    switch (eventType) {
      case 'inked': return 'Inked';
      case 'cleaned': return 'Cleaned';
      case 're-inked': return 'Re-inked';
      default: return eventType;
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const CustomDay = ({ date, displayMonth, ...props }: any) => {
    const events = getEventsForDate(date);
    const hasEvents = events.length > 0;
    const isCurrentMonth = date.getMonth() === displayMonth.getMonth();

    return (
      <button 
        className={`relative w-full h-full flex items-center justify-center p-1 hover:bg-accent rounded-md transition-colors ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}
        onClick={() => setSelectedDate(date)}
        {...props}
      >
        <span className={`${hasEvents ? 'font-bold' : ''}`}>
          {date.getDate()}
        </span>
        {hasEvents && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            {events.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.eventType)}`}
              />
            ))}
            {events.length > 3 && (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{/* Always show side-by-side on medium+ screens */}
        {/* Calendar */}
        <div className="md:col-span-2">{/* Takes 2/3 width on medium+ screens */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="w-full pointer-events-auto"
                components={{
                  Day: CustomDay
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? format(selectedDate, 'MMM dd, yyyy')
                  : 'Select a date'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => {
                      const pen = getPenById(event.penId);
                      const ink = event.inkId ? getInkById(event.inkId) : null;
                      
                      return (
                        <div key={event.id} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge className={getEventTypeColor(event.eventType)}>
                              {getEventTypeLabel(event.eventType)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {pen?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pen?.brand} {pen?.model}
                            </p>
                            {ink && (
                              <p className="text-xs text-muted-foreground">
                                {ink.name} ({ink.brand})
                              </p>
                            )}
                            {event.notes && (
                              <p className="text-xs text-muted-foreground italic">
                                "{event.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No events on this date
                  </p>
                )
              ) : (
                <p className="text-muted-foreground text-sm">
                  Click on a date to see events
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};