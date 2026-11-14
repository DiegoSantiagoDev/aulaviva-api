package com.aulaviva.api.dto.slide;

import java.util.List;

public record SlideContent (
    String title,
    String layout,
    List<String> content
){
}
