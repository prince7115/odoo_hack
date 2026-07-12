package com.assetflow.common.util;

public final class Constants {

    private Constants() {
        throw new UnsupportedOperationException("Constants class cannot be instantiated");
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";
    public static final String ASSET_TAG_PREFIX = "AST";
}
