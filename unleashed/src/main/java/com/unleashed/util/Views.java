package com.unleashed.util;

public class Views {
    public interface ListView {
    } // Change ListView to interface

    public static class CoreView implements ListView {
    }

    public static class DetailedView extends CoreView {
    }

    public static class StockView {
    }

    public static class ProductView {
    }

    public static class TransactionView {
    }
}