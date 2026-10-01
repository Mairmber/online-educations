import { Card, CardContent } from "@/components/ui/card";

export default function StatsCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-4 rounded-2xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}