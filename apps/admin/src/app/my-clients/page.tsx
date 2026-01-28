"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Activity,
  ClipboardList,
  ChevronRight,
  Loader2,
  UserPlus,
  Filter,
} from "lucide-react";
import { Card, CardContent, Button, Input } from "@vt/ui";
import { useAuth } from "@/components/AuthProvider";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  daysSinceVisit: number | null;
  lastVisitDate: string | null;
  pricePerSession: number | null;
}

export default function MyClientsPage() {
  const { user, isTrainer, isAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/trainers/my-clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadClients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500 bg-green-500/10 border-green-500/30";
      case "inactive": return "text-amber-500 bg-amber-500/10 border-amber-500/30";
      case "churned": return "text-red-500 bg-red-500/10 border-red-500/30";
      case "paused": return "text-blue-500 bg-blue-500/10 border-blue-500/30";
      default: return "text-gray-500 bg-gray-500/10 border-gray-500/30";
    }
  };

  const getDaysColor = (days: number | null) => {
    if (days === null) return "text-gray-400";
    if (days <= 7) return "text-green-500";
    if (days <= 14) return "text-amber-500";
    return "text-red-500";
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === "active").length,
    inactive: clients.filter(c => c.status === "inactive").length,
    churned: clients.filter(c => c.status === "churned").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              My Clients
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your assigned clients
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`text-left ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`text-left ${statusFilter === "active" ? "ring-2 ring-green-500" : ""}`}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`text-left ${statusFilter === "inactive" ? "ring-2 ring-amber-500" : ""}`}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-amber-500">{stats.inactive}</p>
              </CardContent>
            </Card>
          </button>
          <button
            onClick={() => setStatusFilter("churned")}
            className={`text-left ${statusFilter === "churned" ? "ring-2 ring-red-500" : ""}`}
          >
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Churned</p>
                <p className="text-2xl font-bold text-red-500">{stats.churned}</p>
              </CardContent>
            </Card>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {statusFilter !== "all" && (
            <Button variant="outline" onClick={() => setStatusFilter("all")}>
              Clear filter
            </Button>
          )}
        </div>

        {/* Clients List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No clients found</p>
              <p className="text-sm mt-1">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "You don't have any assigned clients yet"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <Link key={client.id} href={`/members/${client.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">
                            {client.firstName} {client.lastName}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-2 text-sm">
                      {client.email && (
                        <p className="text-muted-foreground truncate">{client.email}</p>
                      )}
                      {client.phone && (
                        <p className="text-muted-foreground">{client.phone}</p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-muted-foreground">Last visit:</span>
                        <span className={getDaysColor(client.daysSinceVisit)}>
                          {client.daysSinceVisit !== null 
                            ? `${client.daysSinceVisit} days ago`
                            : "Never"
                          }
                        </span>
                      </div>

                      {client.pricePerSession && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Rate:</span>
                          <span className="font-medium">
                            ${(client.pricePerSession / 100).toFixed(0)}/session
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Link
                        href={`/visits?member=${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <Activity className="h-4 w-4" />
                          Log Session
                        </Button>
                      </Link>
                      <Link
                        href={`/prescriptions/new?member=${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full gap-2">
                          <ClipboardList className="h-4 w-4" />
                          Prescription
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
