import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Theme,
  Typography,
  useTheme
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useDropzone } from 'react-dropzone';
import { GridColDef } from '@mui/x-data-grid';

import AddIcon from '@mui/icons-material/Add';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CreateIcon from '@mui/icons-material/Create';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HelpIcon from '@mui/icons-material/Help';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import InfoIcon from '@mui/icons-material/Info';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import LensIcon from '@mui/icons-material/Lens';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ReportRoundedIcon from '@mui/icons-material/ReportRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WarningIcon from '@mui/icons-material/Warning';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import { GxCheckbox } from '../../shared/components/GxCheckbox';
import { GxCollapsibleSection } from '../../shared/components/GxCollapsibleSection';
import { GxColorscaleSlider } from '../../shared/components/GxColorscaleSlider';
import { GxDropzoneButton } from '../../shared/components/GxDropzoneButton';
import { GxFilterTable } from '../../shared/components/GxFilterTable';
import { GxFilterTableColorCell } from '../../shared/components/GxFilterTable/GxFilterTableColorCell';
import { GxGridItem } from '../../shared/components/GxGridItem';
import { GxInput } from '../../shared/components/GxInput';
import { GxLoader } from '../../shared/components/GxLoader';
import { GxLogo } from '../../shared/components/GxLogo';
import { GxModal } from '../../shared/components/GxModal';
import { GxMultiSelect } from '../../shared/components/GxMultiSelect';
import { GxMultiSelectOption } from '../../shared/components/GxMultiSelect/GxMultiSelect.types';
import { GxOverflowTooltip } from '../../shared/components/GxOverflowTooltip';
import { GxRadio } from '../../shared/components/GxRadio';
import { GxSelect } from '../../shared/components/GxSelect';
import { GxSlider } from '../../shared/components/GxSlider';
import { GxSwitch } from '../../shared/components/GxSwitch';
import { GxWindow } from '../../shared/components/GxWindow';
import { InfoTooltip } from '../../components/InfoTooltip';
import { Navigation } from '../../components/Navigation';
import { AddGraphButton } from '../../components/AddGraphButton';
import { NavigationView } from '../../components/Navigation/Navigation.types';
import { ChannelController } from '../../components/ViewController/ChannelsSettingsSection/ChannelControllers/ChannelController';
import { ColormapSelector } from '../../components/ViewController/ChannelsSettingsSection/ColormapSelector';
import { CollapsibleInfoSection } from '../../components/ActiveFiltersPanel/CollapsibleInfoSection';
import { useViewerStore } from '../../stores/ViewerStore';

const ICONS = [
  { Icon: AddIcon, name: 'Add' },
  { Icon: BorderColorIcon, name: 'BorderColor' },
  { Icon: CheckCircleIcon, name: 'CheckCircle' },
  { Icon: ChevronLeftIcon, name: 'ChevronLeft' },
  { Icon: ChevronRightIcon, name: 'ChevronRight' },
  { Icon: ClearIcon, name: 'Clear' },
  { Icon: CloseIcon, name: 'Close' },
  { Icon: CloseRoundedIcon, name: 'CloseRounded' },
  { Icon: CloudIcon, name: 'Cloud' },
  { Icon: CloudUploadIcon, name: 'CloudUpload' },
  { Icon: CreateIcon, name: 'Create' },
  { Icon: DeleteIcon, name: 'Delete' },
  { Icon: DeleteOutlinedIcon, name: 'DeleteOutlined' },
  { Icon: DescriptionIcon, name: 'Description' },
  { Icon: DownloadIcon, name: 'Download' },
  { Icon: DragIndicatorIcon, name: 'DragIndicator' },
  { Icon: ErrorIcon, name: 'Error' },
  { Icon: ExpandMoreIcon, name: 'ExpandMore' },
  { Icon: ExpandMoreRoundedIcon, name: 'ExpandMoreRounded' },
  { Icon: FileDownloadIcon, name: 'FileDownload' },
  { Icon: FileUploadIcon, name: 'FileUpload' },
  { Icon: FolderOpenIcon, name: 'FolderOpen' },
  { Icon: HelpIcon, name: 'Help' },
  { Icon: HighlightOffIcon, name: 'HighlightOff' },
  { Icon: InfoIcon, name: 'Info' },
  { Icon: InsertDriveFileIcon, name: 'InsertDriveFile' },
  { Icon: LensIcon, name: 'Lens' },
  { Icon: MoreVertIcon, name: 'MoreVert' },
  { Icon: OpenInNewIcon, name: 'OpenInNew' },
  { Icon: PhotoCameraIcon, name: 'PhotoCamera' },
  { Icon: ReportRoundedIcon, name: 'ReportRounded' },
  { Icon: RestartAltIcon, name: 'RestartAlt' },
  { Icon: SendIcon, name: 'Send' },
  { Icon: SettingsIcon, name: 'Settings' },
  { Icon: UnfoldLessIcon, name: 'UnfoldLess' },
  { Icon: UnfoldMoreIcon, name: 'UnfoldMore' },
  { Icon: UploadIcon, name: 'Upload' },
  { Icon: VisibilityIcon, name: 'Visibility' },
  { Icon: VisibilityOffIcon, name: 'VisibilityOff' },
  { Icon: WarningIcon, name: 'Warning' },
  { Icon: WarningRoundedIcon, name: 'WarningRounded' }
];

const MULTI_SELECT_OPTIONS: GxMultiSelectOption[] = [
  { value: 'cd3', label: 'CD3' },
  { value: 'cd4', label: 'CD4' },
  { value: 'cd8', label: 'CD8' },
  { value: 'cd20', label: 'CD20' },
  { value: 'foxp3', label: 'FOXP3' }
];

const COLORSCALE = {
  reversed: false,
  value: [
    [0, '#000000'],
    [0.5, '#00b1a4'],
    [1, '#ffffff']
  ] as [number, string][]
};

const MODAL_VARIANTS = ['singular', 'info', 'warning', 'danger'] as const;
const SNACKBAR_VARIANTS = ['brand', 'success', 'warning', 'error', 'info'] as const;

const CHANNEL_OPTIONS = ['Nuclear', 'CD3', 'CD8', 'CD20', 'FOXP3'];

const GRAPH_OPTIONS = [
  { id: 'box', label: 'Expression Box Chart' },
  { id: 'pie', label: 'Pie Chart' },
  { id: 'bar', label: 'Expression Bar Chart' },
  { id: 'heatmap', label: 'Heatmap Chart' }
];

type FilterTableRow = {
  id: string;
  gene_name: string;
  color: [number, number, number];
};

const INITIAL_FILTER_TABLE_ROWS: FilterTableRow[] = [
  { id: 'CD3', gene_name: 'CD3', color: [0, 177, 164] },
  { id: 'CD8', gene_name: 'CD8', color: [251, 202, 0] },
  { id: 'CD20', gene_name: 'CD20', color: [30, 103, 178] },
  { id: 'FOXP3', gene_name: 'FOXP3', color: [251, 0, 0] },
  { id: 'PanCK', gene_name: 'PanCK', color: [177, 146, 24] }
];

type DummyChannel = {
  id: string;
  name: string;
  color: [number, number, number];
  defaultColor: [number, number, number];
  domain: [number, number];
  slider: [number, number];
  defaultSlider: [number, number];
  visible: boolean;
  pixelValue: string;
};

const INITIAL_CHANNELS: DummyChannel[] = [
  {
    id: 'ch-nuclear',
    name: 'Nuclear',
    color: [0, 102, 251],
    defaultColor: [0, 102, 251],
    domain: [0, 65535],
    slider: [500, 20000],
    defaultSlider: [500, 20000],
    visible: true,
    pixelValue: '812'
  },
  {
    id: 'ch-cd3',
    name: 'CD3',
    color: [0, 177, 164],
    defaultColor: [0, 177, 164],
    domain: [0, 65535],
    slider: [1000, 30000],
    defaultSlider: [1000, 30000],
    visible: true,
    pixelValue: '4021'
  }
];

export const ComponentsShowcaseView = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const sx = styles(theme, isDarkMode);

  const [rangeValue, setRangeValue] = useState<number[]>([20, 70]);
  const [singleValue, setSingleValue] = useState<number>(40);
  const [colorscaleThresholds, setColorscaleThresholds] = useState<[number, number]>([0.1, 0.9]);

  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('option-1');

  const [selectValue, setSelectValue] = useState('Nuclear');
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>(['cd3', 'cd8']);

  const [openModal, setOpenModal] = useState<(typeof MODAL_VARIANTS)[number] | null>(null);
  const [showWindow, setShowWindow] = useState(false);

  const [navView, setNavView] = useState<NavigationView>('viewer');

  const [channels, setChannels] = useState<DummyChannel[]>(INITIAL_CHANNELS);
  const [soloChannelId, setSoloChannelId] = useState<string | null>(null);
  const [isChannelsLayerVisible, setIsChannelsLayerVisible] = useState(true);

  useEffect(() => {
    useViewerStore.setState({ channelOptions: CHANNEL_OPTIONS });
  }, []);

  const updateChannel = (id: string, patch: Partial<DummyChannel>) =>
    setChannels((prev) => prev.map((channel) => (channel.id === id ? { ...channel, ...patch } : channel)));

  const [filterTableRows, setFilterTableRows] = useState<FilterTableRow[]>(INITIAL_FILTER_TABLE_ROWS);
  const [activeTableFilters, setActiveTableFilters] = useState<Set<string>>(() => new Set(['CD3', 'CD8']));

  const handleFilterTableColorUpdate = (newColor: number[], geneName: string) =>
    setFilterTableRows((prev) =>
      prev.map((row) => (row.gene_name === geneName ? { ...row, color: newColor as [number, number, number] } : row))
    );

  const filterTableColumns: GridColDef<FilterTableRow>[] = [
    {
      field: 'gene_name',
      headerName: 'Gene name',
      headerAlign: 'center',
      flex: 1,
      renderCell: (params) => <Typography>{params.row.gene_name}</Typography>
    },
    {
      field: 'color',
      headerName: 'Color',
      headerAlign: 'center',
      flex: 1,
      renderCell: (params) => (
        <GxFilterTableColorCell
          currentColor={params.row.color}
          currnetValueName={params.row.gene_name}
          handleColorUpdate={handleFilterTableColorUpdate}
        />
      )
    }
  ];

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    accept: { 'application/zip': ['.zip'] }
  });

  return (
    <Box sx={sx.page}>
      <Box sx={sx.themeToggle}>
        <Typography sx={sx.themeToggleLabel}>Light</Typography>
        <GxSwitch
          checked={isDarkMode}
          onChange={(e) => setIsDarkMode(e.target.checked)}
        />
        <Typography sx={sx.themeToggleLabel}>Dark</Typography>
      </Box>

      <Box sx={sx.header}>
        <GxLogo
          version={isDarkMode ? 'light' : 'dark'}
          size={40}
        />
        <Box>
          <Typography sx={sx.pageTitle}>Component Library</Typography>
          <Typography sx={sx.pageSubtitle}>
            Reference page for redesign work — every reusable Gx component with sample data. Not linked from app
            navigation, reachable only at /components.
          </Typography>
        </Box>
      </Box>

      <ShowcaseSection title="Navigation">
        <Box sx={sx.navigationWrapper}>
          <Navigation
            currentView={navView}
            onViewChange={setNavView}
          />
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Buttons">
        <ShowcaseRow>
          <Button sx={sx.brandButton}>Brand</Button>
          <Button
            variant="outlined"
            sx={sx.outlinedButton}
          >
            Outlined
          </Button>
          <Button
            sx={sx.dangerButton}
            startIcon={<DeleteOutlinedIcon />}
          >
            Danger
          </Button>
          <Button sx={sx.warningButton}>Warning</Button>
          <Button sx={sx.infoButton}>Info</Button>
          <Button
            variant="outlined"
            sx={sx.outlinedButton}
            disabled
          >
            Disabled
          </Button>
          <IconButton sx={sx.iconButtonDemo}>
            <SettingsIcon />
          </IconButton>
          <AddGraphButton
            options={GRAPH_OPTIONS}
            onSelectGraph={() => {}}
          />
        </ShowcaseRow>
        <Box sx={{ ...sx.sidebarPanel, maxWidth: 340, mt: 2 }}>
          <GxDropzoneButton
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            labelTitle="Uploaded file"
            labelText="sample_run.zip"
            buttonText="Upload run archive"
            helperText="Accepted format: .zip"
            isDragActive={isDragActive}
            isDragAccept={isDragAccept}
            isDragReject={isDragReject}
          />
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Inputs">
        <Box sx={sx.sidebarPanel}>
          <ShowcaseRow>
            <GxInput
              label="Sample name"
              defaultValue="Run_2026_09_01"
              size="small"
            />
            <GxInput
              label="With error"
              error
              helperText="Value is required"
              size="small"
            />
            <GxInput
              label="Disabled"
              disabled
              defaultValue="Locked value"
              size="small"
            />
            <GxOverflowTooltip
              value="A very long transcript name that will overflow its container and reveal a tooltip on hover"
              sx={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            />
          </ShowcaseRow>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Dropdowns">
        <ShowcaseRow>
          <GxSelect
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value as string)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            {CHANNEL_OPTIONS.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </GxSelect>
          <GxMultiSelect
            options={MULTI_SELECT_OPTIONS}
            value={multiSelectValue}
            onChange={(e) => setMultiSelectValue(e.target.value as string[])}
            enableSelectAll
            placeholder="Select markers..."
            renderValue={(selected) =>
              (selected as string[])
                .map((val) => MULTI_SELECT_OPTIONS.find((option) => option.value === val)?.label)
                .join(', ')
            }
            sx={{ minWidth: 220, maxWidth: 300 }}
          />
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection title="Sliders">
        <Box sx={{ ...sx.sidebarPanel, maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography sx={sx.controlLabel}>Single value</Typography>
            <GxSlider
              value={singleValue}
              onChange={(_, value) => setSingleValue(value as number)}
            />
          </Box>
          <Box>
            <Typography sx={sx.controlLabel}>Range</Typography>
            <GxSlider
              value={rangeValue}
              onChange={(_, value) => setRangeValue(value as number[])}
            />
          </Box>
          <Box>
            <Typography sx={sx.controlLabel}>Colorscale threshold</Typography>
            <GxColorscaleSlider
              scaleMin={0}
              scaleMax={255}
              colorscale={COLORSCALE}
              lowerThreshold={colorscaleThresholds[0]}
              upperThreshold={colorscaleThresholds[1]}
              onThresholdChange={(lower, upper) => setColorscaleThresholds([lower, upper])}
            />
          </Box>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Toggles">
        <Box sx={sx.sidebarPanel}>
          <ShowcaseRow>
            <FormControlLabel
              control={
                <GxCheckbox
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
              }
              label="Checkbox"
            />
            <FormControlLabel
              control={
                <GxSwitch
                  checked={switchChecked}
                  onChange={(e) => setSwitchChecked(e.target.checked)}
                />
              }
              label="Switch"
            />
            <RadioGroup
              row
              value={radioValue}
              onChange={(e) => setRadioValue(e.target.value)}
            >
              <FormControlLabel
                value="option-1"
                control={<GxRadio />}
                label="Option 1"
              />
              <FormControlLabel
                value="option-2"
                control={<GxRadio />}
                label="Option 2"
              />
            </RadioGroup>
            <Radio disabled />
          </ShowcaseRow>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Modals">
        <ShowcaseRow>
          {MODAL_VARIANTS.map((variant) => (
            <Button
              key={variant}
              variant="outlined"
              sx={sx.outlinedButton}
              onClick={() => setOpenModal(variant)}
            >
              Open {variant}
            </Button>
          ))}
        </ShowcaseRow>
        {MODAL_VARIANTS.map((variant) => (
          <GxModal
            key={variant}
            isOpen={openModal === variant}
            onClose={() => setOpenModal(null)}
            onContinue={() => setOpenModal(null)}
            title={`${variant} modal`}
            colorVariant={variant}
            iconVariant={variant === 'singular' ? 'info' : variant}
          >
            <Typography>
              This is a sample {variant} modal used to preview copy length, icon and button placement.
            </Typography>
          </GxModal>
        ))}
      </ShowcaseSection>

      <ShowcaseSection title="Snackbars">
        <ShowcaseRow>
          {SNACKBAR_VARIANTS.map((variant) => (
            <Button
              key={variant}
              variant="outlined"
              sx={sx.outlinedButton}
              onClick={() =>
                enqueueSnackbar({
                  message: `Sample ${variant} message`,
                  variant: 'gxSnackbar',
                  titleMode: variant
                })
              }
            >
              Show {variant}
            </Button>
          ))}
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection title="Channel controls">
        <Box sx={{ ...sx.sidebarPanel, maxWidth: 480 }}>
          <GxCollapsibleSection
            sectionTitle="Channels"
            defultState="open"
            headerAction={
              <GxCheckbox
                checked={isChannelsLayerVisible}
                onChange={(e) => setIsChannelsLayerVisible(e.target.checked)}
                disableTouchRipple
              />
            }
          >
            <Typography sx={sx.controlLabel}>Colormap</Typography>
            <ColormapSelector />
            <Box sx={sx.channelControllersContainer}>
              {channels.map((channel) => (
                <Box
                  key={channel.id}
                  sx={sx.channelControllerWrapper}
                >
                  <ChannelController
                    name={channel.name}
                    domain={channel.domain}
                    onSelectionChange={(newName) => updateChannel(channel.id, { name: newName })}
                    channelVisible={channel.visible}
                    pixelValue={channel.pixelValue}
                    toggleIsOn={() => updateChannel(channel.id, { visible: !channel.visible })}
                    color={channel.color}
                    defaultColor={channel.defaultColor}
                    isLoading={false}
                    handleColorSelect={(newColor) =>
                      updateChannel(channel.id, { color: newColor as [number, number, number] })
                    }
                    handleRemoveChannel={() => setChannels((prev) => prev.filter((c) => c.id !== channel.id))}
                    slider={channel.slider}
                    defaultSlider={channel.defaultSlider}
                    handleSliderChange={(newValue) => updateChannel(channel.id, { slider: newValue })}
                    handleResetSlider={() => updateChannel(channel.id, { slider: channel.defaultSlider })}
                    isSoloed={soloChannelId === channel.id}
                    isSoloMode={soloChannelId !== null}
                    presoloVisible={channel.visible}
                    onSoloToggle={() => setSoloChannelId((prev) => (prev === channel.id ? null : channel.id))}
                    toggleSelectInSoloMode={() => updateChannel(channel.id, { visible: !channel.visible })}
                  />
                </Box>
              ))}
            </Box>
          </GxCollapsibleSection>
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Info boxes">
        <Box sx={sx.infoBoxStack}>
          <CollapsibleInfoSection
            title="Active filters"
            totalCount={3}
            data={{
              'Transcripts Layer': ['Gene == 3 genes', 'Show filtered points'],
              'Segmentation Layer': ['Cluster ID == 2 clusters']
            }}
          />
          <CollapsibleInfoSection
            title="Hidden Layers"
            totalCount={2}
            data={{ 'Hidden Layers': ['Transcript Layer', 'Segmentation Layer'] }}
          />
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Filter table">
        <Box sx={{ ...sx.sidebarPanel, maxWidth: 420 }}>
          <GxFilterTable
            columns={filterTableColumns}
            rows={filterTableRows}
            activeFilters={activeTableFilters}
            onClearFilters={() => setActiveTableFilters(new Set())}
            onSetFilter={setActiveTableFilters}
            onApplyClick={() =>
              enqueueSnackbar({ message: `Applied filter: ${[...activeTableFilters].join(', ')}`, variant: 'success' })
            }
          />
        </Box>
      </ShowcaseSection>

      <ShowcaseSection title="Grid item / window">
        <ShowcaseRow>
          <Box sx={{ width: 260, height: 160 }}>
            <GxGridItem title="Sample chart">
              <Box sx={sx.gridItemPlaceholder}>Chart content</Box>
            </GxGridItem>
          </Box>
          <Button
            variant="outlined"
            sx={sx.outlinedButton}
            onClick={() => setShowWindow(true)}
          >
            Open floating window
          </Button>
        </ShowcaseRow>
        {showWindow && (
          <GxWindow
            title="Sample window"
            titleTooltip="Draggable, resizable window"
            onClose={() => setShowWindow(false)}
            config={{ startX: 40, startY: 120, startWidth: 320, startHeight: 220 }}
          >
            <Typography
              variant="body2"
              sx={{ color: theme.palette.gx.darkGrey[100] }}
            >
              Drag the handle at the top to move this window around.
            </Typography>
          </GxWindow>
        )}
      </ShowcaseSection>

      <ShowcaseSection title="Loaders & branding">
        <ShowcaseRow>
          <Box sx={{ ...sx.darkSurface, ...sx.loaderWrapper }}>
            <GxLoader version="light" />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={sx.darkSurface}>
              <GxLogo
                version="light"
                size={120}
              />
            </Box>
            <Box sx={{ ...sx.sidebarPanel, width: 'fit-content' }}>
              <GxLogo
                version="dark"
                size={120}
              />
            </Box>
          </Box>
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection title="Tooltips">
        <ShowcaseRow>
          <InfoTooltip title="Small info tooltip" />
          <InfoTooltip
            title="Medium info tooltip"
            size="medium"
          />
        </ShowcaseRow>
      </ShowcaseSection>

      <ShowcaseSection title={`Icons (${ICONS.length})`}>
        <Box sx={sx.iconGrid}>
          {ICONS.map(({ Icon, name }) => (
            <Box
              key={name}
              sx={sx.iconTile}
              title={name}
            >
              <Icon sx={sx.iconGlyph} />
              <Typography sx={sx.iconLabel}>{name}</Typography>
            </Box>
          ))}
        </Box>
      </ShowcaseSection>
    </Box>
  );
};

const ShowcaseSection = ({ title, children }: React.PropsWithChildren<{ title: string }>) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Box sx={sx.section}>
      <Typography sx={sx.sectionTitle}>{title}</Typography>
      <Divider sx={sx.sectionDivider} />
      {children}
    </Box>
  );
};

const ShowcaseRow = ({ children }: React.PropsWithChildren) => {
  const theme = useTheme();
  const sx = styles(theme);
  return <Box sx={sx.row}>{children}</Box>;
};

const styles = (theme: Theme, isDarkMode = false) => ({
  page: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    padding: { xs: '24px 16px', md: '40px 64px' },
    background: isDarkMode ? theme.palette.gx.darkGrey[100] : theme.palette.gx.lightGrey[100],
    color: isDarkMode ? theme.palette.gx.lightGrey[900] : theme.palette.gx.darkGrey[100],
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  themeToggle: {
    position: 'fixed',
    top: { xs: 16, md: 24 },
    right: { xs: 16, md: 24 },
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    padding: '4px 12px',
    borderRadius: '999px',
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`,
    background: isDarkMode ? theme.palette.gx.darkGrey[300] : theme.palette.gx.primary.white,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.25)',
    zIndex: 1000
  },
  themeToggleLabel: {
    fontSize: '12px',
    fontWeight: 600
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 3,
    borderBottom: `1px solid ${theme.palette.gx.mediumGrey[500]}`
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700
  },
  pageSubtitle: {
    fontSize: '13px',
    color: isDarkMode ? theme.palette.gx.mediumGrey[900] : theme.palette.gx.mediumGrey[100],
    maxWidth: 640
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  sectionDivider: {
    borderColor: theme.palette.gx.mediumGrey[500]
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 2
  },
  controlLabel: {
    fontSize: '12px',
    color: theme.palette.gx.mediumGrey[100],
    marginBottom: '4px'
  },
  darkSurface: {
    background: theme.palette.gx.darkGrey[100],
    color: theme.palette.gx.lightGrey[900],
    borderRadius: '8px',
    padding: '16px',
    width: 'fit-content',
    border: isDarkMode ? `1px solid ${theme.palette.gx.darkGrey[500]}` : 'none'
  },
  sidebarPanel: {
    background: theme.palette.gx.lightGrey[100],
    color: theme.palette.gx.darkGrey[100],
    borderRadius: '8px',
    padding: '16px',
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`
  },
  navigationWrapper: {
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`
  },
  channelControllersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingTop: '8px'
  },
  channelControllerWrapper: {
    padding: '8px',
    background: theme.palette.gx.lightGrey[900],
    borderRadius: '4px'
  },
  infoBoxStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: 'fit-content'
  },
  brandButton: {
    color: theme.palette.gx.primary.white,
    fontWeight: 600,
    background: theme.palette.gx.gradients.brand(),
    '&:hover': { boxShadow: `0px 4px 24px ${theme.palette.gx.primary.black}` }
  },
  outlinedButton: {
    color: isDarkMode ? theme.palette.gx.lightGrey[900] : theme.palette.gx.darkGrey[100],
    borderColor: theme.palette.gx.mediumGrey[500],
    '&:hover': { borderColor: theme.palette.gx.accent.greenBlue },
    '&.Mui-disabled': {
      color: isDarkMode ? theme.palette.gx.mediumGrey[700] : theme.palette.gx.mediumGrey[300],
      borderColor: theme.palette.gx.mediumGrey[700]
    }
  },
  dangerButton: {
    color: theme.palette.gx.primary.white,
    fontWeight: 600,
    background: theme.palette.gx.gradients.danger()
  },
  warningButton: {
    color: theme.palette.gx.primary.white,
    fontWeight: 600,
    background: theme.palette.gx.gradients.warning()
  },
  infoButton: {
    color: theme.palette.gx.primary.white,
    fontWeight: 600,
    background: theme.palette.gx.gradients.info()
  },
  iconButtonDemo: {
    color: isDarkMode ? theme.palette.gx.lightGrey[900] : theme.palette.gx.darkGrey[100],
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`
  },
  gridItemPlaceholder: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.gx.mediumGrey[900],
    fontSize: '13px'
  },
  loaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    gap: 1
  },
  iconTile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 4px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`,
    '&:hover': { borderColor: theme.palette.gx.accent.greenBlue }
  },
  iconGlyph: {
    color: isDarkMode ? theme.palette.gx.lightGrey[900] : theme.palette.gx.darkGrey[100]
  },
  iconLabel: {
    fontSize: '10px',
    color: isDarkMode ? theme.palette.gx.mediumGrey[900] : theme.palette.gx.mediumGrey[100],
    textAlign: 'center',
    wordBreak: 'break-word'
  }
});
