import React, { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// Sử dụng theme amCharts Animated
am4core.useTheme(am4themes_animated);

const Column3DChart = ({ chartData }) => {
  useEffect(() => {

    // Log prop chartData khi useEffect chạy
    // console.log("Column3DChart - useEffect triggered, chartData prop:", chartData);

    if (!chartData || chartData.length === 0) return; // Kiểm tra xem có dữ liệu hay không

    // Create chart instance
    let chart = am4core.create("Colunmchartdiv", am4charts.XYChart3D);

    // Add data
    chart.data = chartData;

    // Create X-axis (Category Axis)
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.rotation = 0; // Rotate labels for better visibility

    // Create Y-axis (Value Axis)
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    // Create series
    let series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "revenue";
    series.dataFields.categoryX = "category";
    series.name = "Revenue";
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = 0.9;
    categoryAxis.title.text = "Day"; // Thêm tiêu đề "Day" cho trục X

    // Add column appearance (3D effects)
    series.columns.template.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });
    series.columns.template.adapter.add("stroke", (stroke, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    chart.logo.disabled = true;
    chart.responsive.enabled = true;

    // Clean up the chart instance on component unmount
    return () => {
      chart.dispose();
    };
  }, [chartData]); // Thêm chartData vào mảng phụ thuộc để cập nhật chart mỗi khi dữ liệu thay đổi

  return (
    <div
      id="Colunmchartdiv"
      style={{ width: "100%", height: "500px" }}
    ></div>
  );
};

export default Column3DChart;
