import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Modal, Portal, Text, Button, IconButton, useTheme } from 'react-native-paper';

interface BarcodeScannerModalProps {
    visible: boolean;
    onDismiss: () => void;
    onBarcodeScanned: (data: string) => void;
}

export function BarcodeScannerModal({ visible, onDismiss, onBarcodeScanned }: BarcodeScannerModalProps) {
    const theme = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (visible) {
            setScanned(false);
        }
    }, [visible]);

    const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
        if (scanned) return;
        setScanned(true);
        onBarcodeScanned(data);
        // We don't automatically dismiss/reset here, let the parent decide or wait for re-scan?
        // Usually better to vibrate/sound and wait a moment or close.
        // For this flow, we likely want to close or pause.
        // Let's close for now as per "search/add" flow.
        onDismiss();
    };

    if (!visible) return null;

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        return (
            <Portal>
                <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}>
                    <View style={styles.permissionContainer}>
                        <Text style={{ textAlign: 'center', marginBottom: 16 }}>We need your permission to show the camera</Text>
                        <Button mode="contained" onPress={requestPermission}>grant permission</Button>
                        <Button mode="text" onPress={onDismiss} style={{ marginTop: 8 }}>Cancel</Button>
                    </View>
                </Modal>
            </Portal>
        );
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.fullScreenModal}
            >
                <View style={styles.container}>
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
                        }}
                    />

                    {/* Overlay */}
                    <View style={styles.overlay}>
                        <View style={styles.header}>
                            <Text variant="titleMedium" style={{ color: 'white', fontWeight: 'bold' }}>Scan Barcode</Text>
                            <IconButton icon="close" iconColor="white" onPress={onDismiss} />
                        </View>

                        <View style={styles.scanArea} />

                        <View style={styles.footer}>
                            <Text variant="bodyMedium" style={{ color: 'white', textAlign: 'center' }}>
                                Align code within frame
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 20,
        padding: 24,
        borderRadius: 12,
    },
    fullScreenModal: {
        flex: 1,
        margin: 0,
        justifyContent: 'flex-start',
    },
    permissionContainer: {
        alignItems: 'center',
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 50, // Safe area ish
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: 'white',
        alignSelf: 'center',
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    footer: {
        paddingBottom: 40,
    }
});
