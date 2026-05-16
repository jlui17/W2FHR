package SharedConstants

import (
	"reflect"
	"testing"
)

func TestNormalizeString(t *testing.T) {
	raw := "Thursday, January 02, 2025"
	expected := "Thursday, January 02, 2025"

	normalized := normalizeString(raw)

	if normalized != expected {
		t.Errorf("normalizeString(%q) = %q, want %q", raw, normalized, expected)
	}
}

func TestDToStrArr(t *testing.T) {
	tests := []struct {
		name string
		arr  []interface{}
		want []string
	}{
		{
			name: "empty array",
			arr:  []interface{}{},
			want: []string{},
		},
		{
			name: "single element",
			arr:  []interface{}{"hello"},
			want: []string{"hello"},
		},
		{
			name: "multiple elements",
			arr:  []interface{}{"a", "b", "c"},
			want: []string{"a", "b", "c"},
		},
		{
			name: "normalizes whitespace",
			arr:  []interface{}{"hello   world", "foo\tbar"},
			want: []string{"hello world", "foo bar"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := DToStrArr(tt.arr)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("DToStrArr(%v) = %v, want %v", tt.arr, got, tt.want)
			}
		})
	}
}

func TestDDToStrArr(t *testing.T) {
	tests := []struct {
		name string
		arr  [][]interface{}
		want [][]string
	}{
		{
			name: "empty 2D array",
			arr:  [][]interface{}{},
			want: [][]string{},
		},
		{
			name: "single row single element",
			arr:  [][]interface{}{{"a"}},
			want: [][]string{{"a"}},
		},
		{
			name: "multiple rows",
			arr:  [][]interface{}{{"a", "b"}, {"c", "d"}},
			want: [][]string{{"a", "b"}, {"c", "d"}},
		},
		{
			name: "normalizes whitespace in all elements",
			arr:  [][]interface{}{{"hello   world"}, {"foo\tbar"}},
			want: [][]string{{"hello world"}, {"foo bar"}},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := DDToStrArr(tt.arr)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("DDToStrArr(%v) = %v, want %v", tt.arr, got, tt.want)
			}
		})
	}
}

func TestFlatten(t *testing.T) {
	tests := []struct {
		name string
		arr  [][]interface{}
		want []interface{}
	}{
		{
			name: "empty 2D array",
			arr:  [][]interface{}{},
			want: []interface{}{},
		},
		{
			name: "single row",
			arr:  [][]interface{}{{"a", "b", "c"}},
			want: []interface{}{"a", "b", "c"},
		},
		{
			name: "multiple rows",
			arr:  [][]interface{}{{"a", "b"}, {"c"}, {"d", "e"}},
			want: []interface{}{"a", "b", "c", "d", "e"},
		},
		{
			name: "rows of different types",
			arr:  [][]interface{}{{"hello", 42}, {true, 3.14}},
			want: []interface{}{"hello", 42, true, 3.14},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Flatten(tt.arr)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("Flatten(%v) = %v, want %v", tt.arr, got, tt.want)
			}
		})
	}
}

func TestAll2DArraysSameLength(t *testing.T) {
	tests := []struct {
		name    string
		arrs    [][][]int
		wantErr bool
	}{
		{
			name:    "single array",
			arrs:    [][][]int{{{1, 2, 3}}},
			wantErr: false,
		},
		{
			name:    "all same lengths",
			arrs:    [][][]int{{{1, 2}, {3, 4}}, {{5, 6}, {7, 8}}},
			wantErr: false,
		},
		{
			name:    "different outer lengths",
			arrs:    [][][]int{{{1, 2}}, {{3, 4, 5}}},
			wantErr: true,
		},
		{
			name:    "same shape, single column each",
			arrs:    [][][]int{{{1}, {2}}, {{3}, {4}}},
			wantErr: false,
		},
		{
			name:    "empty inner arrays",
			arrs:    [][][]int{{{}, {}}, {{}, {}}},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ptrs := make([]*[][]int, len(tt.arrs))
			for i := range tt.arrs {
				arr := tt.arrs[i]
				ptrs[i] = &arr
			}
			got := All2DArraysSameLength(ptrs...)
			if (got != nil) != tt.wantErr {
				t.Errorf("All2DArraysSameLength(%v) error = %v, wantErr = %v", tt.arrs, got, tt.wantErr)
			}
		})
	}
}
