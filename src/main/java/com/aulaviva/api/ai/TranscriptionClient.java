package com.aulaviva.api.ai;

import java.nio.file.Path;

public interface TranscriptionClient {

    String transcribe(Path audioFile);
}