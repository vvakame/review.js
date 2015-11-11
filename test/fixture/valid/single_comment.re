= ＼(^o^)／

#@# コメント

ほげほげ
#@# コメント
ほげほげ

ほげほげ
#@# コメント

#@# コメント

#@# allow inline block
//listnum[hello][hello.c][c]{
#@mapfile(../src/hello/hello.c)
#include <mruby.h>
#include <mruby/compile.h>

int
main(void)
{
  mrb_value result;
  mrb_state *mrb = mrb_open();
  result = mrb_load_string(mrb, "p 'hello world!'");
  mrb_close(mrb);
  return 0;
}
#@end
//}
