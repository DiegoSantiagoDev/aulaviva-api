package com.aulaviva.api.service;

final class FileSignature {

    private FileSignature() {
    }

    static boolean matches(String extension, byte[] header)  {
        return switch (extension) {
            case ".jpg", ".jpeg" -> at(header, 0, 0xFF, 0xD8, 0xFF);
            case ".png" -> at(header, 0, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A);
            case ".webp" -> at(header, 0, 'R', 'I', 'F', 'F') && at(header, 8, 'W', 'E', 'B', 'P');
            case ".wav" -> at(header, 0, 'R', 'I', 'F', 'F') && at(header, 8, 'W', 'A', 'V', 'E');
            case ".mp3" -> at(header, 0, 'I', 'D', '3') || isMpegFrame(header);
            case ".m4a" -> at(header, 4, 'f', 't', 'y', 'p');
            case ".ogg" -> at(header, 0, 'O', 'g', 'g', 'S');
            case ".webm" -> at(header, 0, 0x1A, 0x45, 0xDF, 0xA3);
            default -> false;
        };
    }

    private static boolean isMpegFrame(byte[] header) {
        return header.length >= 2
                && (header[0] & 0xFF) == 0xFF
                && (header[1] & 0xE0) == 0xE0;
    }

    private static boolean at(byte[] header, int offset, int... expected) {
        if (header.length < offset + expected.length) {
            return false;
        }

        for (int i = 0; i < expected.length; i++) {
            if (((header[offset + i] & 0xFF) != expected[i])) {
                return false;
            }
        }
        return true;
    }
}
