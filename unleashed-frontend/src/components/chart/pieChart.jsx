import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const PieChart3D = ({ brandPieChartData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Apply the animated theme
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create("chartdiv", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0;

    // Set data
    chart.data = brandPieChartData;

    const series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "litres";
    series.dataFields.category = "country";

    series.slices.template.margin = 0;
    series.slices.template.strokeWidth = 1;
    series.radius = am4core.percent(50); // Make the pie smaller to avoid label cutoff
    series.labels.template.fontSize = 12;
    series.labels.template.wrap = true;
    series.labels.template.truncate = false;

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.useDefaultMarker = true;
    chart.legend.labels.template.fontSize = 14;
    chart.legend.itemContainers.template.marginTop = 5;
    chart.legend.itemContainers.template.marginBottom = 5;

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
  }, [brandPieChartData]);

  return (
    <div
      id="chartdiv"
      style={{
        width: "100%",
        height: "500px",
        maxWidth: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    />
  );
};

export default PieChart3D;
