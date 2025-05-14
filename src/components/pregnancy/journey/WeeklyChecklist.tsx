const WeeklyChecklist: React.FC<WeeklyChecklistProps> = ({
  checklistItems,
  onToggleItem,
  weekNumber
}) => {
  const safeChecklistItems = checklistItems ?? [];

  if (safeChecklistItems.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Week {weekNumber} Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          No symptoms to track for this week
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Week {weekNumber} Symptoms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {safeChecklistItems.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
