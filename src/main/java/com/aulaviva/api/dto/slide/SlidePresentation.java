package com.aulaviva.api.dto.slide;

import java.util.List;

public record SlidePresentation (
        String title,
        List<SlideContent> slides
){
}
