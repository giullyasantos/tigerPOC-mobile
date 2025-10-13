import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WorkOrderCard from "../components/worker/WorkOrderCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WorkOrders() {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['workOrders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const orders = await base44.entities.WorkOrder.filter(
        { assigned_to: user.email },
        "-due_date"
      );
      return orders;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const filteredOrders = workOrders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const getOrderCounts = () => {
    return {
      all: workOrders.length,
      pending: workOrders.filter(o => o.status === "pending").length,
      in_progress: workOrders.filter(o => o.status === "in_progress").length,
      completed: workOrders.filter(o => o.status === "completed").length
    };
  };

  const counts = getOrderCounts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Work Orders</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.full_name || "Worker"}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4 h-auto">
              <TabsTrigger value="all" className="flex flex-col py-2">
                <span className="text-xs">All</span>
                <span className="font-bold">{counts.all}</span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex flex-col py-2">
                <span className="text-xs">Pending</span>
                <span className="font-bold">{counts.pending}</span>
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="flex flex-col py-2">
                <span className="text-xs">In Progress</span>
                <span className="font-bold">{counts.in_progress}</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex flex-col py-2">
                <span className="text-xs">Completed</span>
                <span className="font-bold">{counts.completed}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-500">
              {activeTab === "all" 
                ? "You don't have any assigned work orders yet."
                : `No ${activeTab.replace('_', ' ')} work orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <WorkOrderCard
                key={order.id}
                workOrder={order}
                onClick={() => navigate(createPageUrl(`WorkOrderDetail?id=${order.id}`))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}