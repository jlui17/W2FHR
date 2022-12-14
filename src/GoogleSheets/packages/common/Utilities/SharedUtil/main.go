package SharedUtil

import (
	"GoogleSheets/packages/common/Constants/SharedConstants"
)

func GetIndexOfColumn(columnLetter string) int {
	return SharedConstants.LETTER_TO_NUMBER_MAP[columnLetter]
}
