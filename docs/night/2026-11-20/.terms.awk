NR == FNR { lines[FNR] = $0; n = FNR; next }
{
  slug = $1; s = $2; e = $3; t = $4; cnt = 0
  for (i = s; i <= e; i++) { str = lines[i]; while ((p = index(str, t)) > 0) { cnt++; str = substr(str, p + length(t)) } }
  print slug "\t" t "\t" cnt
}
