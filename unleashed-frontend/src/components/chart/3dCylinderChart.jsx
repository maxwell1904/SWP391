import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const CylinderChart3D = ({ chartData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Apply the animated theme
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create("cylinderdiv", am4charts.XYChart3D);
    chart.hiddenState.properties.opacity = 0; // Makes the chart fade-in

    // Set chart data
    chart.data = chartData;

    // Create X and Y axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "category"; // Set the field for categories
    categoryAxis.renderer.grid.template.location = 0;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minGridDistance = 30;

    // Create series for cylinders
    const series = chart.series.push(new am4charts.ColumnSeries3D());
    series.dataFields.valueY = "value"; // Set the value field for the Y axis
    series.dataFields.categoryX = "category"; // Set the category field for the X axis
    series.columns.template.width = 40;
    series.columns.template.tooltipText = "{category}: [bold]{value}[/]";

    // Adjust appearance of the columns to simulate cylinders
    series.columns.template.column.cornerRadiusTopLeft = 20;
    series.columns.template.column.cornerRadiusTopRight = 20;
    series.columns.template.column.cornerRadiusBottomLeft = 20;
    series.columns.template.column.cornerRadiusBottomRight = 20;
    series.columns.template.column.fillOpacity = 0.8;

    // Add legend
    chart.legend = new am4charts.Legend();

    // Disable amCharts logo
    chart.logo.disabled = true;
    chart.responsive.enabled = true;

    // Store chart instance for cleanup
    chartRef.current = chart;

    return () => {
      // Dispose of chart instance on component unmount
      if (chart) {
        chart.dispose();
      }
    };
  }, [chartData]);

  return <div id="cylinderdiv" style={{ width: "100%", height: "500px", maxWidth: "100%", margin: "0 auto" }} />;
};

export default CylinderChart3D;
