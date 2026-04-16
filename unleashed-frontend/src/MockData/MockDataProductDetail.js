const ProductDetail = 
    {
      productId: "1",
      productName: "Stylish Summer Top",
      availability: 150, // Available stock quantity
      description: "A stylish summer top made from breathable fabrics, perfect for hot weather. Features a relaxed fit and elegant design, available in various colors and sizes.",
      rating: 4.5, // Average rating
      reviewCount: 120, // Number of customer reviews
      variation: [
        {
          variationId: "var1",
          hexCode: "#FF5733", // Color hex code
          sizeName: "S",
          productVariationImage: "https://example.com/image_small.jpg",
          productPrice: 25.99, // Price of this variation
        },
        {
          variationId: "var2",
          hexCode: "#C70039",
          sizeName: "M",
          productVariationImage: "https://example.com/image_medium.jpg",
          productPrice: 26.99,
        },
        {
          variationId: "var3",
          hexCode: "#900C3F",
          sizeName: "L",
          productVariationImage: "https://example.com/image_large.jpg",
          productPrice: 27.99,
        },
      ],
      reviews: [
        {
          reviewId: "rev1",
          fullName: "Jane Doe",
          reviewText: "I absolutely love this top! The material is super soft and it fits perfectly.",
          reviewRating: 5, // Rating for this review
          createAt: "2024-09-10", // Date the review was created
        },
        {
          reviewId: "rev2",
          fullName: "John Smith",
          reviewText: "Good quality, but the sizing is a bit off. I recommend ordering one size up.",
          reviewRating: 4,
          createAt: "2024-09-08",
        },
        {
          reviewId: "rev3",
          fullName: "Emily Johnson",
          reviewText: "The color is slightly different from the picture, but overall it's a great product.",
          reviewRating: 3.5,
          createAt: "2024-09-07",
        },
      ],
    };

  export default ProductDetail;