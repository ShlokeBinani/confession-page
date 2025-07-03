#!/usr/bin/env python
# -*- coding: utf-8 -*-

def find_average(a, b, c, d):
  """
  This function takes four numbers as input and returns their average.
  """
  return (a + b + c + d) / 4

if __name__ == '__main__':
  # Example usage with four numbers
  num1 = 10
  num2 = 20
  num3 = 30
  num4 = 40
  
  average = find_average(num1, num2, num3, num4)
  print(f"The average of {num1}, {num2}, {num3}, and {num4} is: {average}")
