//
//  PDViewController.m
//  PAD2048
//
//  Created by sun zhuoshi on 3/27/14.
//  Copyright (c) 2014 SpringPals. All rights reserved.
//

#import "PDViewController.h"

@interface PDViewController ()

@end

@implementation PDViewController

@synthesize webView = _webView;

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    NSURL *rootURL = [[NSBundle mainBundle] URLForResource:@"index-iOS" withExtension:@"html"];
    [self.webView loadRequest:[NSURLRequest requestWithURL:rootURL]];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
