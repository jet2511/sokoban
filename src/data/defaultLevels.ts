import { LevelData } from '../domain/types';
import { XsbLevelParser } from '../parser/XsbLevelParser';

interface RawLevel {
  id: string;
  chapter: number;
  name: string;
  xsb: string;
  parSteps: number;
}

const rawLevels: RawLevel[] = [
  // CHAPTER 1: BEGINNER (TẬP SỰ)
  {
    id: 'lvl_c1_1',
    chapter: 1,
    name: '1-1: Nhập Môn Nhà Kho',
    parSteps: 8,
    xsb: `#####
#@  #
# $ #
# . #
#####`
  },
  {
    id: 'lvl_c1_2',
    chapter: 1,
    name: '1-2: Đường Thẳng Song Song',
    parSteps: 12,
    xsb: `######
#@   #
# $$ #
# .. #
######`
  },
  {
    id: 'lvl_c1_3',
    chapter: 1,
    name: '1-3: Góc Hẹp Kho Hàng',
    parSteps: 16,
    xsb: `#######
#     #
# @$  #
# $ . #
#   . #
#######`
  },
  {
    id: 'lvl_c1_4',
    chapter: 1,
    name: '1-4: Hành Lang Đơn',
    parSteps: 22,
    xsb: `########
#@     #
# $$$  #
# ...  #
########`
  },
  {
    id: 'lvl_c1_5',
    chapter: 1,
    name: '1-5: Vòng Xoáy Nhỏ',
    parSteps: 28,
    xsb: `######
##   #
#@$$ #
## ..#
 #   #
 #####`
  },

  // CHAPTER 2: ADVANCED (THÀNH THẠO)
  {
    id: 'lvl_c2_1',
    chapter: 2,
    name: '2-1: Kho Chữ T',
    parSteps: 34,
    xsb: `  #####
###   #
#  $  #
# @$  #
###.. #
  #####`
  },
  {
    id: 'lvl_c2_2',
    chapter: 2,
    name: '2-2: Bốn Góc Nhà Kho',
    parSteps: 42,
    xsb: `#######
# . . #
#  $  #
# $ $ #
#  @  #
#######`
  },
  {
    id: 'lvl_c2_3',
    chapter: 2,
    name: '2-3: Ngã Tư Song Song',
    parSteps: 48,
    xsb: ` #####
##   ##
#  $  #
# $.$ #
#  .  #
## @ ##
 #####`
  },
  {
    id: 'lvl_c2_4',
    chapter: 2,
    name: '2-4: Thùng Gỗ Đôi',
    parSteps: 56,
    xsb: `#######
#  .  #
# $#$ #
# .#. #
#  @  #
#######`
  },
  {
    id: 'lvl_c2_5',
    chapter: 2,
    name: '2-5: Đố Vui Ba Hướng',
    parSteps: 62,
    xsb: ` #####
 #   #
##$$$##
# ... #
#  @  #
#######`
  },

  // CHAPTER 3: MASTER (CHUYÊN GIA)
  {
    id: 'lvl_c3_1',
    chapter: 3,
    name: '3-1: Ma Trận Cổ Điển',
    parSteps: 75,
    xsb: `#######
#  ...#
# $$$ #
#@    #
#######`
  },
  {
    id: 'lvl_c3_2',
    chapter: 3,
    name: '3-2: Kho Hàng Micro',
    parSteps: 84,
    xsb: `######
#    #
# $$ #
##$###
# . .#
#@.  #
######`
  },
  {
    id: 'lvl_c3_3',
    chapter: 3,
    name: '3-3: Hầm Tế Ngọc',
    parSteps: 96,
    xsb: `#####
#   #
#$$$#
#...#
# @ #
#####`
  },
  {
    id: 'lvl_c3_4',
    chapter: 3,
    name: '3-4: Đảo Thùng Gỗ',
    parSteps: 110,
    xsb: `########
#  . . #
# $$ $$#
# .@.  #
########`
  },
  {
    id: 'lvl_c3_5',
    chapter: 3,
    name: '3-5: Thách Thức Cuối Cùng',
    parSteps: 130,
    xsb: ` #######
 #  .  #
##$$$$$##
# ..... #
#   @   #
#########`
  }
];

export const DEFAULT_LEVELS: LevelData[] = rawLevels.map(raw => {
  const grid = XsbLevelParser.parse(raw.xsb);
  return {
    id: raw.id,
    chapter: raw.chapter,
    name: raw.name,
    grid,
    width: grid[0].length,
    height: grid.length,
    parSteps: raw.parSteps
  };
});
