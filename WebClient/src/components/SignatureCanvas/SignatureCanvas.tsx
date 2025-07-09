"use client";

import React, { useRef, useState, useEffect } from "react";
import { Box, Button, Group, Stack } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface SignatureCanvasProps {
    onSave: (signatureData: string) => void;
    onCancel: () => void;
    width?: number;
    height?: number;
}

export function SignatureCanvas({ onSave, onCancel, width = 512, height = 256 }: SignatureCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    // Helper function to get correct coordinates accounting for canvas scaling
    const getCanvasCoordinates = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    // Mouse events
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(canvas, e.clientX, e.clientY);

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { x, y } = getCanvasCoordinates(canvas, e.clientX, e.clientY);

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasDrawn(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Touch events
    const startTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const touch = e.touches[0];
        const { x, y } = getCanvasCoordinates(canvas, touch.clientX, touch.clientY);

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const touchDraw = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const touch = e.touches[0];
        const { x, y } = getCanvasCoordinates(canvas, touch.clientX, touch.clientY);

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasDrawn(true);
        }
    };

    const stopTouchDrawing = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
        }
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return;

        const signatureData = canvas.toDataURL("image/png");
        onSave(signatureData);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // Don't fill with white - keep transparent background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    return (
        <Stack gap="md">
            <Box
                style={{
                    border: "2px dashed #dee2e6",
                    borderRadius: "8px",
                    padding: "8px",
                    backgroundColor: "#f8f9fa",
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startTouchDrawing}
                    onTouchMove={touchDraw}
                    onTouchEnd={stopTouchDrawing}
                    style={{
                        cursor: "crosshair",
                        display: "block",
                        backgroundColor: "white", // Visual background for drawing, but canvas data remains transparent
                        borderRadius: "4px",
                        width: "100%",
                        height: "auto",
                        maxWidth: `${width}px`,
                        touchAction: "none", // Prevent scrolling on touch devices
                    }}
                />
            </Box>

            <Group justify="space-between">
                <Button
                    variant="outline"
                    onClick={clearCanvas}
                    disabled={!hasDrawn}
                    leftSection={<IconTrash size={16} />}
                >
                    Clear
                </Button>
                <Group gap="sm">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={saveSignature} disabled={!hasDrawn} className="bg-green-600 hover:bg-green-700">
                        Confirm
                    </Button>
                </Group>
            </Group>
        </Stack>
    );
}
