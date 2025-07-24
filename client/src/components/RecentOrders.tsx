import { Package, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountSection } from "./AccountSection";

const recentOrders = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "delivered",
    total: "$89.99",
    items: 3,
    image: "/placeholder.svg"
  },
  {
    id: "ORD-002", 
    date: "2024-01-10",
    status: "in-transit",
    total: "$124.50",
    items: 2,
    image: "/placeholder.svg"
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    status: "processing",
    total: "$67.25",
    items: 1,
    image: "/placeholder.svg"
  }
];

const statusConfig = {
  delivered: { label: "Delivered", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  "in-transit": { label: "In Transit", icon: Truck, color: "bg-blue-100 text-blue-800" },
  processing: { label: "Processing", icon: Package, color: "bg-yellow-100 text-yellow-800" }
};

export function RecentOrders() {
  return (
    <AccountSection 
      title="Recent Orders" 
      icon={<Package className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        {recentOrders.map((order) => {
          const status = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          
          return (
            <div key={order.id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{order.id}</h4>
                  <Badge variant="secondary" className={status.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.date} • {order.items} item{order.items > 1 ? 's' : ''} • {order.total}
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          );
        })}
        
        <Button variant="premium" className="w-full">
          View All Orders
        </Button>
      </div>
    </AccountSection>
  );
}