"use client";

import { useState } from "react";

import { Box, Divider, Group, Flex, Stack, Space } from "@mantine/core";
import { Avatar, Title, Text, TextInput } from "@mantine/core";
import { Anchor, Button, FileButton, Modal, Switch } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function ProfilePage() {
  const [image, setImage] = useState<File | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  
  console.debug("Rendering ProfilePage");
  return (
    <div>
      <Box mx="auto" p="lg">
        <Title order={3} mb="sm">Profile</Title>
        <Divider mb="lg" />

        <Flex justify="space-between" align="flex-start" wrap="wrap" w="100%">
          <Group gap={20}>
            <Avatar
              variant="light"
              radius="lg"
              size={100}
              color="#258ce6"
              src=""
            />
            <Stack gap={0}>
              <Text size="sm" c="dimmed">Canteen Manager</Text>
              <Text fw={600} size="lg">Brian Federin</Text>
              <Text size="sm" c="dimmed">@brianfederin</Text>
            </Stack>
          </Group>
        
          <FileButton onChange={setImage} accept="image/png,image/jpeg">
            {(props) => (
              <Button {...props} variant="outline" size="sm">
                Edit Profile
              </Button>
            )}
          </FileButton>
          
          {/* .... */}
          {image && (
            <Text size="sm" ta="right" mt="sm">
              Picked file: {image.name}
            </Text>
          )}
          {/* .... */}
        </Flex>

        <Divider my="lg" />

        <Title order={4} mb="sm">Account Security</Title>
        
        <Flex justify="space-between" align="end" w="100%" gap="lg">
          <Stack w="100%" style={{ flexGrow: 1, minWidth: 0 }}>
            <TextInput
              label="Email"
              placeholder="brianfederin@gmail.com"
              size="sm"
              disabled
              w="100%"
              style={{ flexGrow: 1, minWidth: 0 }}
              labelProps={{ style: { marginBottom: 6 } }}
            />
          </Stack>

            <Button
              variant="outline"
              size="sm"
              style={{
              height: 35,
              whiteSpace: 'nowrap',
              width: 165,
              flexShrink: 0,
              }}
            >
              Change email
            </Button>
        </Flex>

        <Space h="md" />

        <Flex justify="space-between" align="end" w="100%" gap="lg">
          <Stack w="100%" style={{ flexGrow: 1, minWidth: 0 }}>
            <TextInput
              label="Password"
              value="********"
              size="sm"
              disabled
              w="100%"
              style={{ flexGrow: 1, minWidth: 0 }}
              labelProps={{ style: { marginBottom: 6 } }}
            />
          </Stack>
          
          <Modal opened={opened} onClose={close} title="Update Password" centered>
            <Stack>
              <TextInput
                label="Current Password"
                placeholder=""
                type="password"
                required
              />
              <TextInput
                label="New Password"
                placeholder="At least 8 characters"
                type="password"
                required
              />
              <TextInput
                label="Confirm Password"
                placeholder="At least 8 characters"
                type="password"
                required
              />

              <Button
                variant="filled"
                color="blue"
              >
                Update Password
              </Button>

              <Anchor
                size="xs"
                style={{
                  color: "gray",
                  textAlign: "center",
                  cursor: "pointer" }}
              >
                Forgotten your password?
              </Anchor>
            </Stack>
          </Modal>

          <Button
            variant="outline"
            size="sm"
            style={{
            height: 35,
            whiteSpace: 'nowrap',
            width: 165,
            flexShrink: 0
            }}
            onClick={open}
          >
            Change password
          </Button>
        </Flex>

        <Space h="md" />

        <Group justify="space-between" mt="md">
          <Box>
            <Text fw={500} size="sm">2-Step Verification</Text>
            <Text size="xs" c="dimmed">
              Add an additional layer of security to your account during login.
            </Text>
          </Box>
          <Switch />
        </Group>

      </Box>
    </div>
  );
}
