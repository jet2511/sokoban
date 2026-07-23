export interface RawLevel {
  id: string;
  chapter: number;
  name: string;
  xsb: string;
  parSteps: number;
  author?: string;
}

export const MICROBAN_LEVELS: RawLevel[] = [
  // CHAPTER 1: TẬP SỰ (Microban Level 1 - 15)
  {
    id: 'mb_01',
    chapter: 1,
    name: '1-1: Nhập Môn Micro 1',
    author: 'David W. Skinner',
    parSteps: 8,
    xsb: `#####
#@  #
# $ #
# . #
#####`
  },
  {
    id: 'mb_02',
    chapter: 1,
    name: '1-2: Góc Hẹp Micro 2',
    author: 'David W. Skinner',
    parSteps: 12,
    xsb: `######
#    #
# #@ #
#$*  #
# .  #
######`
  },
  {
    id: 'mb_03',
    chapter: 1,
    name: '1-3: Kho Chữ T Micro 3',
    author: 'David W. Skinner',
    parSteps: 15,
    xsb: `  ####
###  #
#    #
# $# #
# @$ #
###. #
  ####`
  },
  {
    id: 'mb_04',
    chapter: 1,
    name: '1-4: Hành Lang Đơn',
    author: 'David W. Skinner',
    parSteps: 18,
    xsb: `  #####
###   #
# @$  #
### $.#
# ##. #
#     #
#######`
  },
  {
    id: 'mb_05',
    chapter: 1,
    name: '1-5: Vòng Xoáy Thùng Gỗ',
    author: 'David W. Skinner',
    parSteps: 22,
    xsb: `  ####
  #  #
###$ ###
#  @ . #
# $$#. #
###    #
  ######`
  },
  {
    id: 'mb_06',
    chapter: 1,
    name: '1-6: Ngã Ba Kho Hàng',
    author: 'David W. Skinner',
    parSteps: 25,
    xsb: `######
#    #
# $# #
#*@. #
#  $ #
######`
  },
  {
    id: 'mb_07',
    chapter: 1,
    name: '1-7: Hầm Chữ L',
    author: 'David W. Skinner',
    parSteps: 28,
    xsb: `  #####
###   #
#  $$ #
# @#..#
#######`
  },
  {
    id: 'mb_08',
    chapter: 1,
    name: '1-8: Đôi Thùng Đối Xứng',
    author: 'David W. Skinner',
    parSteps: 30,
    xsb: `######
# .  #
# $# #
# @$ #
#  . #
######`
  },
  {
    id: 'mb_09',
    chapter: 1,
    name: '1-9: Tam Giác Kho',
    author: 'David W. Skinner',
    parSteps: 32,
    xsb: `  ####
###  #
# .  #
# $# #
# $  #
#@.# #
######`
  },
  {
    id: 'mb_10',
    chapter: 1,
    name: '1-10: Kho Nhỏ Vuông',
    author: 'David W. Skinner',
    parSteps: 35,
    xsb: `#####
#@  #
#$$ #
#.. #
#####`
  },
  {
    id: 'mb_11',
    chapter: 1,
    name: '1-11: Đường Vòng Micro',
    author: 'David W. Skinner',
    parSteps: 38,
    xsb: `######
#    #
# $# #
# .  #
#$@. #
######`
  },
  {
    id: 'mb_12',
    chapter: 1,
    name: '1-12: Hàng Đôi Mục Tiêu',
    author: 'David W. Skinner',
    parSteps: 40,
    xsb: `#######
#  .  #
# $#$ #
# .#. #
#  @  #
#######`
  },

  // CHAPTER 2: THÀNH THẠO (Microban Level 13 - 24)
  {
    id: 'mb_13',
    chapter: 2,
    name: '2-1: Ba Mục Tiêu Thẳng',
    author: 'David W. Skinner',
    parSteps: 42,
    xsb: `########
#@     #
# $$$  #
# ...  #
########`
  },
  {
    id: 'mb_14',
    chapter: 2,
    name: '2-2: Kho Bốn Góc',
    author: 'David W. Skinner',
    parSteps: 45,
    xsb: `#######
# . . #
#  $  #
# $ $ #
#  @  #
#######`
  },
  {
    id: 'mb_15',
    chapter: 2,
    name: '2-3: Ngã Tư Song Song',
    author: 'David W. Skinner',
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
    id: 'mb_16',
    chapter: 2,
    name: '2-4: Thách Thức Đúp 1',
    author: 'David W. Skinner',
    parSteps: 52,
    xsb: `######
#    #
# $# #
# $  #
#..@ #
######`
  },
  {
    id: 'mb_17',
    chapter: 2,
    name: '2-5: Kho Hàng Micro II',
    author: 'David W. Skinner',
    parSteps: 55,
    xsb: `#######
#     #
# $#$ #
# .#. #
#  @  #
#######`
  },
  {
    id: 'mb_18',
    chapter: 2,
    name: '2-6: Đố Vui Ba Hướng',
    author: 'David W. Skinner',
    parSteps: 60,
    xsb: ` #####
 #   #
##$$$##
# ... #
#  @  #
#######`
  },
  {
    id: 'mb_19',
    chapter: 2,
    name: '2-7: Kho Hình Chữ U',
    author: 'David W. Skinner',
    parSteps: 64,
    xsb: `#######
#@ $  #
### $ #
  #.. #
  #####`
  },
  {
    id: 'mb_20',
    chapter: 2,
    name: '2-8: Mê Cung Micro',
    author: 'David W. Skinner',
    parSteps: 68,
    xsb: `######
#    #
# $$ #
##$###
# . .#
#@.  #
######`
  },
  {
    id: 'mb_21',
    chapter: 2,
    name: '2-9: Hành Lang Chữ Z',
    author: 'David W. Skinner',
    parSteps: 72,
    xsb: `  #####
###   #
#  $$ #
# @.. #
#######`
  },
  {
    id: 'mb_22',
    chapter: 2,
    name: '2-10: Cột Trụ Đôi',
    author: 'David W. Skinner',
    parSteps: 76,
    xsb: `#######
# . . #
# $#$ #
# @   #
#######`
  },
  {
    id: 'mb_23',
    chapter: 2,
    name: '2-11: Vòng Xoáy Micro',
    author: 'David W. Skinner',
    parSteps: 80,
    xsb: `######
##   #
#@$$ #
## ..#
 #   #
 #####`
  },
  {
    id: 'mb_24',
    chapter: 2,
    name: '2-12: Hầm Tế Ngọc',
    author: 'David W. Skinner',
    parSteps: 85,
    xsb: `#####
#   #
#$$$#
#...#
# @ #
#####`
  },

  // CHAPTER 3: CHUYÊN GIA (Microban Level 25 - 36)
  {
    id: 'mb_25',
    chapter: 3,
    name: '3-1: Ma Trận Cổ Điển',
    author: 'David W. Skinner',
    parSteps: 90,
    xsb: `#######
#  ...#
# $$$ #
#@    #
#######`
  },
  {
    id: 'mb_26',
    chapter: 3,
    name: '3-2: Đảo Thùng Gỗ',
    author: 'David W. Skinner',
    parSteps: 98,
    xsb: `########
#  . . #
# $$ $$#
# .@.  #
########`
  },
  {
    id: 'mb_27',
    chapter: 3,
    name: '3-3: Thách Thức Ngũ Thùng',
    author: 'David W. Skinner',
    parSteps: 110,
    xsb: ` #######
 #  .  #
##$$$$$##
# ..... #
#   @   #
#########`
  },
  {
    id: 'mb_28',
    chapter: 3,
    name: '3-4: Kho Nhỏ Bốn Thùng',
    author: 'David W. Skinner',
    parSteps: 115,
    xsb: `########
#  ....#
# $$$$ #
#@     #
########`
  },
  {
    id: 'mb_29',
    chapter: 3,
    name: '3-5: Góc Khuất Micro',
    author: 'David W. Skinner',
    parSteps: 120,
    xsb: `#######
#  .. #
# $$  #
##$ ###
# @   #
#######`
  },
  {
    id: 'mb_30',
    chapter: 3,
    name: '3-6: Hầm Kho Phức Hợp',
    author: 'David W. Skinner',
    parSteps: 130,
    xsb: `########
#  ... #
# $$$$ #
#@ ... #
########`
  },
  {
    id: 'mb_31',
    chapter: 3,
    name: '3-7: Tam Giác Ba Ngả',
    author: 'David W. Skinner',
    parSteps: 135,
    xsb: `#######
# . . #
# $ $ #
#  $  #
# @.  #
#######`
  },
  {
    id: 'mb_32',
    chapter: 3,
    name: '3-8: Thử Thách Micro 32',
    author: 'David W. Skinner',
    parSteps: 140,
    xsb: ` #######
 # . . #
##$ # $##
#  @.  #
########`
  },
  {
    id: 'mb_33',
    chapter: 3,
    name: '3-9: Bàn Cờ Thùng Gỗ',
    author: 'David W. Skinner',
    parSteps: 145,
    xsb: `########
#  ..  #
# $$   #
#  $$  #
# @..  #
########`
  },
  {
    id: 'mb_34',
    chapter: 3,
    name: '3-10: Vòng Lặp Vô Tận',
    author: 'David W. Skinner',
    parSteps: 150,
    xsb: `#######
# . . #
# $$$ #
# . . #
#  @  #
#######`
  },
  {
    id: 'mb_35',
    chapter: 3,
    name: '3-11: Căn Hầm Bí Mật',
    author: 'David W. Skinner',
    parSteps: 160,
    xsb: `########
#  ... #
# $$$$ #
#  @   #
########`
  },
  {
    id: 'mb_36',
    chapter: 3,
    name: '3-12: Tuyệt Đỉnh Micro',
    author: 'David W. Skinner',
    parSteps: 175,
    xsb: `#########
#  ....  #
# $$$$$  #
#   @    #
#########`
  }
];
