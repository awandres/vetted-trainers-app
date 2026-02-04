"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Table,
  Upload,
  RefreshCw,
  Download,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Loader2,
  Info,
  HardDrive,
  Calendar,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Progress,
} from "@vt/ui";

interface TableStats {
  name: string;
  count: number;
  displayName: string;
}

interface DatabaseInfo {
  tables: TableStats[];
  totalRecords: number;
  lastUpdated: string | null;
}

export default function DataPage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDbInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data/stats");
      if (!res.ok) throw new Error("Failed to fetch database info");
      const data = await res.json();
      setDbInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDbInfo();
  }, []);

  const handleSeedDummyData = async () => {
    if (!confirm("This will add sample/dummy data to your database. Existing data will be preserved. Continue?")) {
      return;
    }

    setIsSeeding(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/data/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed data");
      const data = await res.json();
      setMessage(data.message || "Sample data added successfully!");
      await fetchDbInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed data");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("⚠️ WARNING: This will DELETE ALL DATA from your database. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }

    if (!confirm("FINAL CONFIRMATION: Type 'DELETE' mentally and click OK to proceed with clearing all data.")) {
      return;
    }

    setIsClearing(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/data/clear", { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear data");
      const data = await res.json();
      setMessage(data.message || "Database cleared successfully!");
      await fetchDbInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear data");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-6 w-6" />
                Data Management
              </h1>
              <p className="text-muted-foreground">
                Database info, imports, and data management
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchDbInfo} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Database Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Database Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Database Overview
                </CardTitle>
                <CardDescription>Current data in your database</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : dbInfo ? (
                  <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-muted-foreground">Total Records</p>
                        <p className="text-3xl font-bold text-primary">
                          {dbInfo.totalRecords.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground">Tables</p>
                        <p className="text-3xl font-bold">{dbInfo.tables.length}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Table Breakdown */}
                    <div>
                      <h4 className="text-sm font-medium mb-4">Table Breakdown</h4>
                      <div className="space-y-3">
                        {dbInfo.tables.map((table) => (
                          <div key={table.name} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{table.displayName}</span>
                                <span className="text-sm text-muted-foreground">
                                  {table.count.toLocaleString()}
                                </span>
                              </div>
                              <Progress
                                value={dbInfo.totalRecords > 0 ? (table.count / dbInfo.totalRecords) * 100 : 0}
                                className="h-2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Unable to load database info</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Import Wizard (Placeholder) */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Data
                  <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Upload CSV files to import or sync data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="font-medium mb-2">CSV Import Wizard</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload Vetted Trainers CSV files to import member data, sessions, and more.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Members</Badge>
                    <Badge variant="outline">Sessions</Badge>
                    <Badge variant="outline">Contracts</Badge>
                    <Badge variant="outline">Payroll</Badge>
                  </div>
                  <Button className="mt-4" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV (Coming Soon)
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/10">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sync Mode</p>
                    <p className="text-sm text-muted-foreground">
                      When importing, you'll have the option to:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                      <li><strong>Replace All:</strong> Clear existing data and import fresh</li>
                      <li><strong>Sync:</strong> Add new records only, show what was added</li>
                      <li><strong>Update:</strong> Update existing records, add new ones</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSeedDummyData}
                  disabled={isSeeding}
                >
                  {isSeeding ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Seed Sample Data
                </Button>
                <p className="text-xs text-muted-foreground px-1">
                  Add sample members, sessions, and contracts for testing
                </p>

                <Separator />

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleClearData}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Clear All Data
                </Button>
                <p className="text-xs text-muted-foreground px-1">
                  ⚠️ Permanently delete all data from database
                </p>
              </CardContent>
            </Card>

            {/* Database Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <Badge variant="outline">Neon PostgreSQL</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ORM</span>
                  <span>Drizzle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment</span>
                  <Badge variant="secondary">
                    {process.env.NODE_ENV || "development"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Sandbox Mode (Future Feature) */}
            <Card className="border-dashed opacity-75">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Sandbox Mode
                  <Badge variant="secondary" className="text-xs">Future</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  A separate sandbox database for testing without affecting production data.
                </p>
                <p className="mt-2">
                  This feature will allow you to switch between production and sandbox environments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
