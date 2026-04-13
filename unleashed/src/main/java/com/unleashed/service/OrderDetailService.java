package com.unleashed.service;

import com.unleashed.dto.mapper.OrderDetailMapper;
import com.unleashed.entity.OrderVariationSingle;
import com.unleashed.repo.OrderVariationSingleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailService {

    @Autowired
    private OrderVariationSingleRepository orderVariationSingleRepository;

    @Autowired
    private OrderDetailMapper orderDetailMapper;

//    public List<OrderDetailDTO> getOrderDetailsByOrderId(String orderId) {
//        List<OrderVariationSingle> orderDetails = orderVariationSingleRepository.findByOrder_OrderId(orderId);
//        return orderDetails.stream()
//                .map(orderDetailMapper::toDTO)
//                .collect(Collectors.toList());
//    }

    public void saveOrderVariationSingle(OrderVariationSingle orderVariationSingle) {
        if (orderVariationSingle != null) {
            orderVariationSingleRepository.save(orderVariationSingle);
        } else {
            throw new IllegalArgumentException("Order detail cannot be null");
        }
    }

    public void saveAll(List<OrderVariationSingle> orderVariationSingles) {
        if (orderVariationSingles != null && !orderVariationSingles.isEmpty()) {
            orderVariationSingleRepository.saveAll(orderVariationSingles);
        } else {
            throw new IllegalArgumentException("Order details list cannot be null or empty");
        }
    }
}
