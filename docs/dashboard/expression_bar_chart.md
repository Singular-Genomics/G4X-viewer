# expression bar chart

---

<br>

Learn how to compare expression values or protein intensities across selected ROIs using bar charts.

## reference image

![expression bar chart controls](../images/dashboard/barplot_controls.png)

<br>

## features

An expression bar chart is most useful for clearly comparing average expression levels of a gene or protein across conditions or groups, often with error bars to show variability. It provides a simple, intuitive view of the magnitude and direction of expression changes.

- <b><u>Select ROIs:</u></b>

    This drop down has a multiselect feature which allows you to choose which ROIs to display and compare. You can choose them one-at-a-time by checking each desired box, or you can **Select All**.

- <b><u>Select Modality:</u></b>

    This drop down menu allows you to choose whether to focus on `RNA` or `protein`.

- <b><u>Select Target:</u></b>

    This drop down menu allows you to choose the specific `RNA` or `protein` targets to display relative abundances of.

- <b><u>Group By:</u></b>

    This category determines the second level breakdown for bar display. Options are `cluster Id`, `roi`, and `none`. 

- <b><u>Plot Settings:</u></b>
    
    The settings menu changes structural aspects of the plot related to axes, colorbars, and labels. This menu is shared across all plots. For each plot, the options are specific to the type of plot that is being made. For barplots, the options are as follow:

    - **Custom Title:** Input a string to display as your plot title.
    - **Swap Axis:** Allows swap of X and Y axes.
    - **Sort ROIs:** Places all ROI in sequential order in which they were drawn.
    - **Bar Mode:** Changes what type of bar display is used (group, stack, relative, overlay).

- <b><u>Legend Toggle:</u></b>

    In the G4X Viewer, any time a legend is displayed, the points displayed can be modified by left clicking once or twice on a given legend element. This feature is shared across most interactable Plotly plots found in G4X outputs. 

    - `Single click:` Hides selected category. Multiple can be hidden at once. Single clicking again will unhide.
    - `Double click:` Hides all categories except for the selected group.

<br>

--8<-- "_core/_partials/end_cap.md"
