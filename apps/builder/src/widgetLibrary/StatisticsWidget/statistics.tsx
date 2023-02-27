import { FC, useCallback, useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import { Statistic } from "@illa-design/react"
import { getBuilderInfo } from "@/redux/builderInfo/builderInfoSelector"
import { AllData } from "@/widgetLibrary/IconWidget/utils"
import { AutoHeightContainer } from "@/widgetLibrary/PublicSector/AutoHeightContainer"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import {
  StatisticWidgetProps,
  WrappedStatisticProps,
} from "@/widgetLibrary/StatisticsWidget/interface"
import {
  contentContainerStyle,
  getPrefixIconStyle,
  getSecondaryStatisticContainerStyle,
  getSecondaryStatisticStyle,
  getStatisticContainerStyle,
  getStatisticStyle,
  statisticContainerStyle,
  statisticTitleStyle,
} from "@/widgetLibrary/StatisticsWidget/style"

const getNumberGroupSeparator = (value: number | undefined, lang: string) => {
  if (value === undefined) {
    return ""
  }
  const numberFormat = new Intl.NumberFormat(lang, {
    style: "decimal",
  })
  const parts = numberFormat
    .formatToParts(value)
    .filter((part) => part.type === "group")
  return parts[0]?.value ?? ""
}

const getIcon = (iconName: string) => (iconName && AllData[iconName]) || null

const getTrendSignAndIcon = (
  show: boolean,
  value?: number,
  positiveSign?: string,
  negativeSign?: string,
  color?: string,
  secondary?: boolean,
) => {
  const positiveSignIcon = getIcon(positiveSign ?? "")
  const negativeSignIcon = getIcon(negativeSign ?? "")
  const icon = (value ?? 0.0) >= 0 ? positiveSignIcon : negativeSignIcon

  return (
    show &&
    icon && (
      <span css={getPrefixIconStyle(color, secondary)}>{icon && icon({})}</span>
    )
  )
}

export const WrappedStatistic: FC<WrappedStatisticProps> = (props) => {
  const builderInfo = useSelector(getBuilderInfo)
  const {
    label,
    primaryValue,
    secondaryValue,
    decimalPlace,
    prefixText,
    suffixText,
    secondaryPrefixText,
    secondarySuffixText,
    showTrendSign,
    positiveSign,
    negativeSign,
    showSeparator,
    enableTrendColor,
    secondaryDecimalPlace,
    secondaryShowTrendSign,
    secondaryPositiveSign,
    secondaryNegativeSign,
    secondaryShowSeparator,
    secondaryEnableTrendColor,
    textAlign,
    handleOnClick,
    colorScheme,
    negativeColorScheme,
    positiveColorScheme,
  } = props

  const groupSeparator = showSeparator
    ? getNumberGroupSeparator(primaryValue, builderInfo.language)
    : ""
  const secondaryGroupSeparator = secondaryShowSeparator
    ? getNumberGroupSeparator(secondaryValue, builderInfo.language)
    : ""

  const getColor = useCallback(
    (value?: number, enableTrendColor?: boolean) => {
      return enableTrendColor
        ? value !== undefined && value >= 0
          ? positiveColorScheme
          : negativeColorScheme
        : colorScheme
    },
    [colorScheme, negativeColorScheme, positiveColorScheme],
  )

  const color = getColor(primaryValue, enableTrendColor)
  const secondaryColor = getColor(secondaryValue, secondaryEnableTrendColor)

  const icon = getTrendSignAndIcon(
    !!showTrendSign,
    primaryValue,
    positiveSign,
    negativeSign,
    color,
  )

  const secondaryIcon = getTrendSignAndIcon(
    !!secondaryShowTrendSign,
    secondaryValue,
    secondaryPositiveSign,
    secondaryNegativeSign,
    secondaryColor,
    true,
  )

  const suffixNode = useMemo(
    () => (
      <>
        {secondaryValue && (
          <div css={getSecondaryStatisticContainerStyle(secondaryColor)}>
            {secondaryIcon}
            <Statistic
              _css={getSecondaryStatisticStyle(secondaryColor)}
              groupSeparator={secondaryGroupSeparator}
              value={secondaryValue}
              precision={secondaryDecimalPlace}
              prefix={secondaryPrefixText}
              suffix={secondarySuffixText}
            />
          </div>
        )}
      </>
    ),
    [
      secondaryColor,
      secondaryDecimalPlace,
      secondaryGroupSeparator,
      secondaryIcon,
      secondaryPrefixText,
      secondarySuffixText,
      secondaryValue,
    ],
  )

  return (
    <div css={getStatisticContainerStyle(textAlign)} onClick={handleOnClick}>
      {icon}
      <div css={contentContainerStyle}>
        <div css={statisticTitleStyle}>{label}</div>
        <div css={statisticContainerStyle}>
          <Statistic
            _css={getStatisticStyle(color)}
            value={primaryValue}
            precision={decimalPlace}
            prefix={prefixText}
            suffix={suffixText}
            groupSeparator={groupSeparator}
          />
          {suffixNode}
        </div>
      </div>
    </div>
  )
}
WrappedStatistic.displayName = "WrappedStatistic"

export const StatisticWidget: FC<StatisticWidgetProps> = (props) => {
  const {
    primaryValue,
    triggerEventHandler,
    handleUpdateDsl,
    displayName,
    tooltipText,
    updateComponentHeight,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
  } = props

  useEffect(() => {
    handleUpdateGlobalData?.(displayName, {
      setPrimaryValue: (value: number) => {
        handleUpdateDsl({ primaryValue: value })
      },
      resetPrimaryValue: () => {
        handleUpdateDsl({
          primaryValue,
        })
      },
    })
    return () => {
      handleDeleteGlobalData(displayName)
    }
  }, [
    displayName,
    handleDeleteGlobalData,
    handleUpdateDsl,
    handleUpdateGlobalData,
    primaryValue,
  ])

  const handleOnClick = useCallback(() => {
    triggerEventHandler("click")
  }, [triggerEventHandler])

  return (
    <AutoHeightContainer
      updateComponentHeight={updateComponentHeight}
      enable={true}
    >
      <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
        <WrappedStatistic {...props} handleOnClick={handleOnClick} />
      </TooltipWrapper>
    </AutoHeightContainer>
  )
}
StatisticWidget.displayName = "StatisticWidget"
