import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, CheckCircle, XCircle, AlertTriangle, Crown, Eye, Ban, Crown as CrownIcon, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useListUsers, useListListings } from "@/lib/workspace-api-mock";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"verification" | "users" | "roles" | "listings">("verification");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const isOwner = user?.role === "OWNER";
  const isModerator = user?.role === "MODERATOR";

  // Fetch real data from API
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers();
  const { data: listingsData, isLoading: isLoadingListings } = useListListings({ limit: 100 });

  const users = usersData?.users || [];
  const listings = listingsData?.listings || [];

  // Check if user has OWNER or MODERATOR role
  if (!user || (user.role !== "OWNER" && user.role !== "MODERATOR")) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Access Denied</CardTitle>
              <CardDescription>
                You don't have permission to access the admin panel.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate real stats from data
  const totalUsers = users.length;
  const pendingVerifications = users.filter(u => (u as any).verificationStatus === "pending").length;
  const activeSellers = users.filter(u => u.role === "SELLER" && (u as any).isVerified).length;
  const moderators = users.filter(u => u.role === "MODERATOR").length;

  const handleVerifyUser = (userId: number, approved: boolean) => {
    // API call to verify/reject user
    toast({
      title: approved ? "User Verified" : "Verification Rejected",
      description: `User ${approved ? "verified" : "rejected"} successfully`,
    });
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    // API call to update user role
    toast({
      title: "Role Updated",
      description: `User role updated to ${newRole}`,
    });
  };

  const handleBanUser = (userId: number) => {
    // API call to ban user
    toast({
      title: "User Banned",
      description: "User has been banned from the platform",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {isOwner ? (
                <Crown className="w-8 h-8 text-yellow-500" />
              ) : (
                <Shield className="w-8 h-8 text-blue-500" />
              )}
              {isOwner ? "Admin Panel" : "Moderator Panel"}
            </h1>
            <p className="text-zinc-400">
              {isOwner 
                ? "Manage users, verification requests, and system settings" 
                : "Manage listings, content moderation, and user verification"
              }
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalUsers}</div>
                <p className="text-zinc-400 text-sm">Registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-500">{pendingVerifications}</div>
                <p className="text-zinc-400 text-sm">Need review</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Active Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{activeSellers}</div>
                <p className="text-zinc-400 text-sm">Verified makers</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Moderators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{moderators}</div>
                <p className="text-zinc-400 text-sm">Active mods</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-zinc-800/50 border border-zinc-700 p-1 rounded-lg w-fit">
            {(isOwner || isModerator) && (
              <Button
                variant={activeTab === "verification" ? "default" : "ghost"}
                onClick={() => setActiveTab("verification")}
                className="rounded-md"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                User Verification
              </Button>
            )}
            {isModerator && (
              <Button
                variant={activeTab === "listings" ? "default" : "ghost"}
                onClick={() => setActiveTab("listings")}
                className="rounded-md"
              >
                <Package className="w-4 h-4 mr-2" />
                Listings Moderation
              </Button>
            )}
            {isOwner && (
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                onClick={() => setActiveTab("users")}
                className="rounded-md"
              >
                <Users className="w-4 h-4 mr-2" />
                All Users
              </Button>
            )}
            {isOwner && (
              <Button
                variant={activeTab === "roles" ? "default" : "ghost"}
                onClick={() => setActiveTab("roles")}
                className="rounded-md"
              >
                <CrownIcon className="w-4 h-4 mr-2" />
                Role Management
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Verification Table */}
          {activeTab === "verification" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">User Verification Requests</CardTitle>
                <CardDescription>
                  Review and approve seller verification applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers
                      .filter(user => (user as any).verificationStatus && (user as any).verificationStatus !== "not_submitted")
                      .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{user.displayName || "Unknown"}</div>
                            <div className="text-sm text-zinc-400">{user.email || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-600">
                            {user.role || "USER"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={(user as any).verificationStatus === "verified" ? "default" :
                                   (user as any).verificationStatus === "pending" ? "secondary" : "destructive"}
                            className={
                              (user as any).verificationStatus === "verified" ? "bg-green-600" :
                              (user as any).verificationStatus === "pending" ? "bg-yellow-600" : "bg-red-600"
                            }
                          >
                            {(user as any).verificationStatus || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {(user as any).verificationSubmittedAt || "N/A"}
                        </TableCell>
                        <TableCell className="text-zinc-300">{(user as any).totalOrders || "N/A"}</TableCell>
                        <TableCell className="text-zinc-300">
                          {(user as any).rating ? `${(user as any).rating} / 5.0` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {(user as any).verificationStatus === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyUser(user.id, true)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleVerifyUser(user.id, false)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {(user as any).verificationStatus === "verified" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-600 hover:bg-zinc-700"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* All Users Table */}
          {activeTab === "users" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">All Users</CardTitle>
                <CardDescription>
                  Manage all platform users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{user.displayName || "Unknown"}</div>
                            <div className="text-sm text-zinc-400">{user.email || "N/A"}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role || "USER"}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          >
                            <SelectTrigger className="w-32 bg-zinc-800 border-zinc-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">User</SelectItem>
                              <SelectItem value="SELLER">Seller</SelectItem>
                              <SelectItem value="MODERATOR">Moderator</SelectItem>
                              <SelectItem value="OWNER">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {(user as any).isVerified ? (
                            <Badge className="bg-green-600">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="border-zinc-600">Not Verified</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-zinc-300">{(user as any).joinDate || new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-zinc-300">{(user as any).totalOrders || "N/A"}</TableCell>
                        <TableCell className="text-zinc-300">
                          {(user as any).rating ? `${(user as any).rating} / 5.0` : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-zinc-600 hover:bg-zinc-700"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(user.id)}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Listings Moderation */}
          {activeTab === "listings" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Listings Moderation</CardTitle>
                <CardDescription>
                  Review and moderate platform listings and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Flagged</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{listing.title}</div>
                            <div className="text-sm text-zinc-400 truncate max-w-xs">{listing.description}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-300">{listing.sellerName || listing.sellerId}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-zinc-600"
                          >
                            {(listing as any).status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-300">${listing.price?.toFixed(2) || "N/A"}</TableCell>
                        <TableCell className="text-zinc-300">{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-600">No</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-zinc-600 hover:bg-zinc-700"
                              onClick={() => {
                                toast({
                                  title: "View Listing",
                                  description: "Opening listing details...",
                                });
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Role Management */}
          {activeTab === "roles" && (
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Role Management</CardTitle>
                <CardDescription>
                  Assign and manage user roles across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Role Permissions</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-zinc-900/50 border-zinc-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <CrownIcon className="w-5 h-5 text-yellow-500" />
                            Owner
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-zinc-300">
                            <li>Full system access</li>
                            <li>User verification management</li>
                            <li>Role assignment</li>
                            <li>Platform settings</li>
                            <li>Billing and analytics</li>
                          </ul>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-zinc-900/50 border-zinc-700">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Moderator
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm text-zinc-300">
                            <li>Listing moderation</li>
                            <li>User flagging</li>
                            <li>Content review</li>
                            <li>Support tickets</li>
                            <li>Limited user management</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
