"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil } from "lucide-react";

export default function AccountSettings() {
  const [isEditing, setIsEditing] = useState(false);

  // Simulated user data (replace)
  const [user, setUser ] = useState({
    name: "Pedro Duarte",
    username: "@peduarte",
    email: "pedro@example.com",
    role: "Superintendent",
    profilePic: ""
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [id]: value }));
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Temporarily display uploaded image
      setUser((prevUser) => ({
        ...prevUser,
        profilePic: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  return (
    <div>
      <div className="content-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="flex justify-between items-center mt-4">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account details below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-4"><div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.profilePic || "/path/to/default/pic.jpg"} alt="Profile picture" />
                    <AvatarFallback>PD</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                  <label
                    htmlFor="upload"
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Pencil className="w-5 h-5 text-gray-700" />
                  </label>
                )}
                  <input
                    type="file"
                    className="hidden"
                    id="upload"
                    onChange={handleProfilePicChange}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={user.name} disabled={!isEditing} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user.username} disabled={!isEditing} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input id="email" value={user.email} disabled={!isEditing} onChange={handleChange} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              {!isEditing ? (
                <Button onClick={handleEditClick}>Edit Profile</Button>
              ) : (
                <Button onClick={handleSaveClick}>Save Changes</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}