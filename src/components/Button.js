import cn from "classnames";
import Link from "next/link";
import PropTypes from "prop-types";
import React from "react";

import Icon from "./Icon";

const Button = React.forwardRef(
  (
    {
      className,
      iconClassName,
      color,
      disabled,
      size,
      context,
      href,
      icon,
      hoverIcon,
      hoverColor,
      children,
      width,
      ...remaining
    },
    ref,
  ) => {
    // Use a default button when no href is passed, use a link when href is passed
    const Element = href ? Link : "button";
    const InnerElement = href ? "a" : "div";
    const isExternal = href && href.startsWith("http");

    const classes = cn(
      className,
      "inline-block group relative rounded-full uppercase leading-none shadow whitespace-nowrap tracking-[0.19em] font-sans font-semibold overflow-hidden hover:scale-[1.05] duration-300 transition-transform user-select-none",
      {
        // Color modifiers
        "bg-white text-black": color === "white",
        "bg-yellow text-black": color === "yellow",
        "bg-lightBlue text-black": color === "lightBlue",
        "bg-blue text-white": color === "blue",
        "bg-darkNavy text-white": color === "darkNavy",
        "bg-lightGray text-black": color === "lightGray",
        // Width modifiers
        "w-full": width === "full",
        "opacity-50 cursor-default pointer-events-none": disabled,
      },
    );

    const contentClasses = cn("flex items-center justify-center", {
      "px-9 pt-4 pb-[18px]": size === "default",
      "px-4 py-[11px] text-[12px]": size === "small",
    });

    const hoverClasses = cn(
      contentClasses,
      "absolute top-0 left-0 w-full h-full clip-path-polygon-[0%_0%,_0%_0%,_0%_100%,_0%_100%] group-hover:clip-path-polygon-[0px_0px,_100%_0px,_100%_100%,_0px_100%] transition-all duration-500",
      hoverColor
        ? // When hover color is present, ignore the system we have
          {
            "bg-yellow text-black": hoverColor === "yellow",
            "bg-orange text-white": hoverColor === "orange",
            "bg-white text-black": hoverColor === "white",
            "bg-blue text-white": hoverColor === "blue",
            "bg-lightBlue text-black": hoverColor === "lightBlue",
          }
        : {
            "bg-yellow": context === "light",
            "bg-yellow": context === "orange" && color === "white",
            "bg-[#fff]": context === "orange" && color === "yellow",
            "bg-lightBlue":
              (context === "blue" || context === "dark") && color === "white",
            "bg-white":
              (context === "blue" || context === "dark") &&
              color === "lightBlue",
            "bg-darkNavy": context === "light" && color === "blue",
            "bg-blue": context === "light" && color === "darkNavy",
            "bg-orange text-white": context === "light" && color === "yellow",
          },
    );

    const content = (
      <>
        <span>{children}</span>
        {icon ? (
          <div className={cn("ml-[14px]", iconClassName)}>
            <Icon name={icon} />
          </div>
        ) : hoverIcon ? (
          <div
            className={cn(
              iconClassName,
              "group-hover:pl-[14px] max-w-0 group-hover:max-w-[80px] block overflow-hidden transition-all duration-300",
            )}
          >
            <Icon name={hoverIcon} />
          </div>
        ) : null}
      </>
    );

    return (
      <Element
        ref={ref}
        className={href ? undefined : classes}
        href={href}
        disabled={disabled}
        {...remaining}
      >
        <InnerElement
          className={href ? classes : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          <div className={contentClasses}>{content}</div>
          <div className={hoverClasses} aria-hidden="true">
            {content}
          </div>
        </InnerElement>
      </Element>
    );
  },
);

Button.propTypes = {
  href: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(["default", "small"]),
  color: PropTypes.oneOf([
    "yellow",
    "white",
    "lightBlue",
    "blue",
    "darkNavy",
    "lightGray",
  ]),
  disabled: PropTypes.bool,
  // Where is this button rendered? What is it's background? Determines the hover color
  context: PropTypes.oneOf(["light", "dark", "orange", "blue"]),
  // Really shouldn't be used but this allows for overriding the system set by context
  hoverColor: PropTypes.oneOf([
    "yellow",
    "white",
    "lightBlue",
    "blue",
    "darkNavy",
    "lightGray",
    ""
  ]),
  icon: PropTypes.string,
  iconClasses: PropTypes.string,
  hoverIcon: PropTypes.string,
  width: PropTypes.oneOf(["auto", "full"]),
};

Button.defaultProps = {
  size: "default",
  color: "yellow",
  context: "light",
  width: "auto",
  disabled: false,
};

Button.displayName = "Button";

export default Button;
